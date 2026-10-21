/**
 * Legends, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  grant,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Avoid Fate", () => {
  it("counters an Aura spell that targets a creature you control, but not one aimed elsewhere", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    const elsewhere = toHand(game, "Curiosity");
    cast(game, elsewhere, { targets: [ref(theirs)], settle: false });
    const fate = toHand(game, "Avoid Fate");
    const at = (spell: ObjectId): Action => ({ type: "cast-spell", player: A, card: fate, targets: [ref(spell)] });
    expect(game.canDispatch(at(elsewhere))).not.toBeNull();
    settle(game);
    const aura = toHand(game, "Curiosity");
    cast(game, aura, { targets: [ref(mine)], settle: false });
    cast(game, fate, { targets: [ref(aura)] });
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, fate)).toBe("graveyard");
  });
});

describe("Hell's Caretaker", () => {
  it("reanimates during your upkeep only, and may sacrifice itself", () => {
    const { game } = table({ step: "upkeep" });
    const caretaker = spawn(game, "Hell's Caretaker");
    const giant = toGraveyard(game, "Hill Giant");
    const self: Action = {
      type: "activate-ability",
      player: A,
      source: caretaker,
      abilityIndex: 0,
      targets: [ref(giant)],
      sacrifice: caretaker,
    } as Action;
    expect(game.canDispatch(self)).toBeNull();
    game.dispatch(self);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, caretaker)).toBe("graveyard");

    toStep(game, "precombat-main");
    const second = spawn(game, "Hell's Caretaker");
    const bears = toGraveyard(game, "Grizzly Bears");
    const act: Action = {
      type: "activate-ability",
      player: A,
      source: second,
      abilityIndex: 0,
      targets: [ref(bears)],
      sacrifice: second,
    } as Action;
    expect(game.canDispatch(act)).not.toBeNull();
  });
});

describe("Nicol Bolas", () => {
  it("makes an opponent it damages discard their whole hand", () => {
    const { game, a } = table();
    const bolas = spawn(game, "Nicol Bolas");
    expect(hand(game, B).length).toBeGreaterThan(0);
    attack(game, a, [bolas]);
    expect(life(game, B)).toBe(13);
    expect(hand(game, B).length).toBe(0);
  });
});

describe("Recall", () => {
  it("discards X, then returns that many cards from the graveyard — the discarded ones allowed — and exiles itself", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toHand(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    lands(game, "Island", 5);
    a.chooseDiscardsFn = () => [bears, elves];
    const offered = pickFromZone(a, giant, bears);
    const before = hand(game).length;
    const recall = toHand(game, "Recall");
    cast(game, recall, { x: 2 });
    expect(offered.offered).toContain(elves);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, elves)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(zone(game, recall)).toBe("exile");
  });
});

describe("Arena of the Ancients", () => {
  it("taps every legendary creature as it enters, and they stay tapped", () => {
    const { game } = table();
    const legend = spawn(game, "Isamaru, Hound of Konda", B);
    const plain = spawn(game, "Grizzly Bears", B);
    enter(game, "Arena of the Ancients");
    expect(game.state.objects[legend].tapped).toBe(true);
    expect(game.state.objects[plain].tapped).toBe(false);
    nextTurn(game);
    expect(game.state.objects[legend].tapped).toBe(true);
  });
});

describe("Backfire", () => {
  it("deals the damage the enchanted creature deals you back to its controller", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Backfire"), { targets: [ref(bears)] });
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Serpent Generator", () => {
  it("makes a Snake whose damage to a player gives a poison counter", () => {
    const { game, a } = table();
    const generator = spawn(game, "Serpent Generator");
    lands(game, "Wastes", 4);
    activate(game, generator);
    const snake = game.battlefield.find((id) => game.state.objects[id].cardName === "Snake Token (artifact, poison)")!;
    expect(pt(game, snake)).toEqual({ power: 1, toughness: 1 });
    game.state.objects[snake].summoningSick = false;
    attack(game, a, [snake]);
    expect(game.state.players[B].counters.poison).toBe(1);
  });
});

describe("Arcades Sabboth", () => {
  it("gives +0/+2 to each untapped creature you control that isn't attacking", () => {
    const { game, a } = table();
    const arcades = spawn(game, "Arcades Sabboth");
    const bears = spawn(game, "Grizzly Bears");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, arcades)).toEqual({ power: 7, toughness: 9 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, tapped)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    grant(game, bears, "vigilance");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.objects[bears].attacking === B);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Part Water", () => {
  it("gives X target creatures islandwalk for {X}{X}{U}", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    lands(game, "Island", 4);
    const water = toHand(game, "Part Water");
    const at: Action = { type: "cast-spell", player: A, card: water, targets: [ref(one), ref(two)], xValue: 2 };
    expect(game.canDispatch(at)).not.toBeNull();
    lands(game, "Island", 1);
    cast(game, water, { x: 2, targets: [ref(one), ref(two)] });
    expect(keywords(game, one).has("islandwalk")).toBe(true);
    expect(keywords(game, two).has("islandwalk")).toBe(true);
  });
});

describe("Hellfire", () => {
  it("deals 3 plus the number of nonblack creatures that died, tokens included, to you", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Snake Token", count: 1 }, []);
    const black = spawn(game, "Hell's Caretaker", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Hellfire"));
    expect(zone(game, black)).toBe("battlefield");
    expect(graveyard(game, B).some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
    expect(life(game, A)).toBe(14);
    expect(life(game, B)).toBe(20);
  });
});

describe("Presence of the Master", () => {
  it("counters each enchantment spell cast", () => {
    const { game } = table();
    spawn(game, "Presence of the Master", B);
    lands(game, "Island", 3);
    const alarm = toHand(game, "Intruder Alarm");
    cast(game, alarm);
    expect(zone(game, alarm)).toBe("graveyard");
  });
});
