/**
 * Kaladesh (and Commander 2016's last cards), group A: the clause of each card
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  types,
  zone,
} from "./harness.js";

const loseLife = (game: Game, who: typeof A, n: number): void =>
  game.debugApplyEffect(who, { kind: "lose-life", amount: n, who: "you" }, []);

const setCounters = (game: Game, id: ObjectId, c: Record<string, number>): void => {
  game.state.objects[id].counters = { ...c };
};

describe("Benefactor's Draught", () => {
  it("untaps every creature, anyone's, and draws a card", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 2);
    const draught = toHand(game, "Benefactor's Draught");
    const before = hand(game).length;
    cast(game, draught);
    expect(game.state.objects[mine].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(hand(game).length).toBe(before); // the Draught left, a card came in
  });

  it("a block by an opponent's creature draws a card", () => {
    const { game, a, b } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Benefactor's Draught"));
    const before = hand(game).length;
    b.declareBlockersFn = () => [{ blocker, attacker }];
    attack(game, a, [attacker]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Ludevic, Necro-Alchemist", () => {
  it("the player whose end step it is may draw if an opponent of Ludevic's controller lost life", () => {
    const { game, a } = table();
    spawn(game, "Ludevic, Necro-Alchemist");
    loseLife(game, B, 1);
    pickModes(a, 0);
    const before = hand(game).length;
    nextTurn(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("only Ludevic's controller losing life draws nothing", () => {
    const { game, a } = table();
    spawn(game, "Ludevic, Necro-Alchemist");
    loseLife(game, A, 3);
    pickModes(a, 0);
    const before = hand(game).length;
    nextTurn(game);
    expect(hand(game).length).toBe(before);
  });

  it("on an opponent's end step it's that player who may draw", () => {
    const { game, b } = table();
    spawn(game, "Ludevic, Necro-Alchemist");
    nextTurn(game); // bob's turn
    loseLife(game, B, 2);
    pickModes(b, 0);
    const bobBefore = hand(game, B).length;
    const aliceBefore = hand(game).length;
    nextTurn(game); // alice's turn 3, after her draw step
    expect(hand(game, B).length).toBe(bobBefore + 1);
    expect(hand(game).length).toBe(aliceBefore + 1); // her own draw step only
  });
});

describe("Grave Upheaval", () => {
  it("reanimates from an opponent's graveyard under your control with haste", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Grave Upheaval"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Grip of Phyresis", () => {
  it("takes the Equipment and attaches it to a fresh Germ", () => {
    const { game } = table();
    const sledge = spawn(game, "Behemoth Sledge", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Grip of Phyresis"), { targets: [ref(sledge)] });
    expect(controller(game, sledge)).toBe(A);
    const [germ] = named(game, "Phyrexian Germ Token", A);
    expect(germ).toBeDefined();
    expect(game.state.objects[sledge].attachedTo).toBe(germ);
    expect(pt(game, germ)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Saheeli's Artistry", () => {
  it("the creature mode's copy is an artifact as well", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Saheeli's Artistry"), { modes: [1], targets: [ref(bears)] });
    const [copy] = named(game, "Grizzly Bears", A);
    expect(copy).toBeDefined();
    expect(types(game, copy)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });
});

describe("Fateful Showdown", () => {
  it("deals damage equal to the hand without itself, then wheels that many", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const showdown = toHand(game, "Fateful Showdown");
    const n = hand(game).length - 1;
    cast(game, showdown, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - n);
    expect(hand(game).length).toBe(n);
  });
});

describe("Aetherborn Marauder", () => {
  it("moves +1/+1 counters from other permanents you control, never offering itself", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ingot = spawn(game, "Darksteel Ingot");
    setCounters(game, bears, { "+1/+1": 2 });
    setCounters(game, ingot, { "+1/+1": 1 });
    const offered: (readonly ObjectId[])[] = [];
    const queue = [bears, ingot];
    a.choosePermanentsFn = (_view, eligible) => {
      offered.push(eligible);
      const next = queue.shift();
      return next === undefined ? [] : [next];
    };
    // Each "how many" question: take them all (the last option).
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.length - 1];
    const marauder = enter(game, "Aetherborn Marauder");
    expect(offered[0]).toEqual(expect.arrayContaining([bears, ingot]));
    expect(offered[0]).not.toContain(marauder);
    expect(counters(game, marauder)).toBe(3);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, ingot)).toBe(0);
  });
});

describe("Built to Smash", () => {
  it("only an artifact creature gains trample", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const memnite = spawn(game, "Memnite");
    lands(game, "Mountain", 2);
    a.declareAttackersFn = () => [bears, memnite].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, toHand(game, "Built to Smash"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Built to Smash"), { targets: [ref(memnite)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(pt(game, memnite)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, memnite).has("trample")).toBe(true);
  });
});

describe("Toolcraft Exemplar", () => {
  it("+2/+1 with one artifact; first strike too with three", () => {
    const one = table();
    const ex1 = spawn(one.game, "Toolcraft Exemplar");
    spawn(one.game, "Darksteel Ingot");
    one.game.advanceUntil((s) => s.turn.step === "begin-combat" && s.priority.holder === A && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(pt(one.game, ex1)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(one.game, ex1).has("first-strike")).toBe(false);

    const three = table();
    const ex3 = spawn(three.game, "Toolcraft Exemplar");
    for (let i = 0; i < 3; i++) spawn(three.game, "Darksteel Ingot");
    three.game.advanceUntil((s) => s.turn.step === "begin-combat" && s.priority.holder === A && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(pt(three.game, ex3)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(three.game, ex3).has("first-strike")).toBe(true);
  });

  it("no artifact, no bonus", () => {
    const { game } = table();
    const ex = spawn(game, "Toolcraft Exemplar");
    game.advanceUntil((s) => s.turn.step === "begin-combat" && s.priority.holder === A && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(pt(game, ex)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Electrostatic Pummeler", () => {
  it("enters with three energy, and paying it doubles its power and adds that to toughness", () => {
    const { game } = table();
    const pummeler = enter(game, "Electrostatic Pummeler");
    expect(game.state.players[A].energy).toBe(3);
    activate(game, pummeler);
    expect(game.state.players[A].energy).toBe(0);
    expect(pt(game, pummeler)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Demon of Dark Schemes", () => {
  it("gets energy as others die, and spends four to reanimate tapped", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears");
    const demon = enter(game, "Demon of Dark Schemes");
    expect(pt(game, demon)).toEqual({ power: 5, toughness: 5 });
    expect(game.state.players[A].energy).toBe(2);
    game.state.players[A].energy = 4;
    const dead = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    activate(game, demon, 0, { targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("battlefield");
    expect(controller(game, dead)).toBe(A);
    expect(game.state.objects[dead].tapped).toBe(true);
    expect(game.state.players[A].energy).toBe(0);
  });
});
