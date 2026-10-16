/**
 * Set walk batch 87, part f (2026-10-15): Modern Horizons 3 (MH3) and Modern Horizons 3 Commander (M3C), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { nameOf } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const energy = (game: Game, player: PlayerId = A): number => game.state.players[player].energy ?? 0;
const setEnergy = (game: Game, n: number, player: PlayerId = A): void => {
  game.state.players[player].energy = n;
};
const castOffers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);
const faceDown = (game: Game, player: PlayerId = A): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined && game.state.objects[id].controller === player);
/** Answer each modes question (a `may` is one too) with the next of these. */
function modesInOrder(seat: ScriptedController, ...answers: (readonly number[])[]): void {
  const queue = [...answers];
  seat.chooseModesFn = () => [...(queue.shift() ?? [])];
}
const named0 = (game: Game, name: string): boolean => game.battlefield.some((id) => game.state.objects[id].cardName === name);
const addCounter = (game: Game, id: ObjectId, counter = "+1/+1"): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount: 1 }, [ref(id)]);

describe("Ral and the Implicit Maze", () => {
  // `spawn` puts a Saga's first lore counter on it, chapter I waiting.
  it("I — 2 damage to each creature and planeswalker your opponents control, none to yours", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const jace = spawn(game, "Jace Beleren", B);
    spawn(game, "Ral and the Implicit Maze");
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, jace, "loyalty")).toBe(1);
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("II — a discard exiles the top two, playable through your next turn", () => {
    const { game, a } = table();
    const saga = spawn(game, "Ral and the Implicit Maze");
    settle(game);
    spawn(game, "Mountain");
    const bolt = toLibrary(game, "Lightning Bolt");
    const shock = toLibrary(game, "Shock");
    toLibrary(game, "Grizzly Bears"); // drawn in turn 3's draw step
    const handBefore = hand(game).length;
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, saga, "lore")).toBe(2);
    // Drew the Bears, discarded a card, and exiled the two below.
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(1);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, shock)).toBe("exile");
    expect(castOffers(game, bolt).length).toBeGreaterThan(0);
    // Still castable on the next turn (an opponent's), as an instant.
    game.advanceUntil((s) => s.turn.number === 4 && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(castOffers(game, bolt).length).toBeGreaterThan(0);
  });

  it("II — declining discards nothing and exiles nothing", () => {
    const { game, a } = table();
    spawn(game, "Ral and the Implicit Maze");
    settle(game);
    const bolt = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "precombat-main");
    settle(game);
    expect(graveyard(game).length).toBe(0);
    expect(zone(game, bolt)).toBe("library");
  });

  it("III — creates Spellgorger Weird, a {2}{R} token that grows on noncreature spells", () => {
    const { game } = table();
    const saga = spawn(game, "Ral and the Implicit Maze");
    settle(game);
    game.state.objects[saga].counters.lore = 2;
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, saga)).toBe("graveyard");
    expect(tokensNamed(game, "Spellgorger Weird Token", A)).toBe(1);
    const weird = game.battlefield.find((id) => game.state.objects[id].cardName === "Spellgorger Weird Token")!;
    expect(nameOf(game.state.objects[weird])).toBe("Spellgorger Weird");
    spawn(game, "Mountain");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, weird)).toBe(1);
    // A copy of the card: mana value 3, so Expel the Unworthy (mana value 3
    // or less) can exile it, and its controller gains 3.
    lands(game, "Plains", 2);
    const lifeBefore = life(game, A);
    cast(game, toHand(game, "Expel the Unworthy"), { targets: [ref(weird)] });
    expect(life(game, A)).toBe(lifeBefore + 3);
  });
});

describe("Conduit Goblin", () => {
  it("gets {E}{E}; at your combat, {E} gives another creature +1/+0 and haste", () => {
    const { game, a } = table();
    const goblin = enter(game, "Conduit Goblin");
    expect(energy(game)).toBe(2);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(energy(game)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
  });

  it("declined, or with no energy, nothing happens", () => {
    const { game, a } = table();
    enter(game, "Conduit Goblin");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "begin-combat");
    settle(game);
    expect(energy(game)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Ondu Knotmaster // Throw a Line", () => {
  it("another modified creature of yours dying puts two +1/+1 counters on it; an unmodified one doesn't", () => {
    const { game } = table();
    const ondu = spawn(game, "Ondu Knotmaster");
    const plain = spawn(game, "Grizzly Bears");
    destroy(game, plain);
    expect(counters(game, ondu)).toBe(0);
    const modified = spawn(game, "Grizzly Bears");
    addCounter(game, modified, "stun"); // any kind of counter
    destroy(game, modified);
    expect(counters(game, ondu)).toBe(2);
    // An opponent's modified creature isn't yours.
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounter(game, theirs);
    destroy(game, theirs);
    expect(counters(game, ondu)).toBe(2);
  });

  it("Throw a Line splits two counters over two targets, or both on one, then the creature is castable from exile", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Ondu Knotmaster");
    cast(game, card, { targets: [ref(x), ref(y)], face: 1 });
    expect(counters(game, x)).toBe(1);
    expect(counters(game, y)).toBe(1);
    expect(zone(game, card)).toBe("exile");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === card && o.via === "adventure")).toBe(
      true,
    );

    const { game: g2 } = table();
    lands(g2, "Plains", 1);
    lands(g2, "Swamp", 1);
    const z = spawn(g2, "Grizzly Bears");
    cast(g2, toHand(g2, "Ondu Knotmaster"), { targets: [ref(z), null], face: 1 });
    expect(counters(g2, z)).toBe(2);
  });
});

describe("Petrifying Meddler", () => {
  it("casting it taps up to one target creature and stuns it", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const meddler = toHand(game, "Petrifying Meddler");
    cast(game, meddler);
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
    expect(zone(game, meddler)).toBe("battlefield");
  });
});

describe("Guardian of the Forgotten", () => {
  it("a modified creature of yours dying — itself included — manifests the top card; an unmodified one doesn't", () => {
    const { game } = table();
    const guardian = spawn(game, "Guardian of the Forgotten");
    const plain = spawn(game, "Grizzly Bears");
    destroy(game, plain);
    expect(faceDown(game)).toHaveLength(0);
    const modified = spawn(game, "Grizzly Bears");
    addCounter(game, modified);
    destroy(game, modified);
    expect(faceDown(game)).toHaveLength(1);
    addCounter(game, guardian);
    destroy(game, guardian);
    expect(faceDown(game)).toHaveLength(2);
    expect(pt(game, faceDown(game)[1])).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Voltstorm Angel", () => {
  it("gets {E}{E}{E}; at your combat, {E}{E} gives it vigilance and lifelink", () => {
    const { game, a } = table();
    const angel = enter(game, "Voltstorm Angel");
    expect(energy(game)).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    modesInOrder(a, [0], [0]);
    toStep(game, "begin-combat");
    settle(game);
    expect(energy(game)).toBe(1);
    expect(keywords(game, angel).has("vigilance")).toBe(true);
    expect(keywords(game, angel).has("lifelink")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("or other creatures you control get +1/+1, not the Angel", () => {
    const { game, a } = table();
    const angel = enter(game, "Voltstorm Angel");
    const bears = spawn(game, "Grizzly Bears");
    modesInOrder(a, [0], [1]);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, angel).has("lifelink")).toBe(false);
  });

  it("declined, nothing is paid", () => {
    const { game, a } = table();
    enter(game, "Voltstorm Angel");
    pickModes(a);
    toStep(game, "begin-combat");
    settle(game);
    expect(energy(game)).toBe(3);
  });
});

describe("Sage of the Unknowable", () => {
  it("its {C} casts a colorless spell but not a colored one", () => {
    const { game } = table();
    spawn(game, "Sage of the Unknowable");
    cast(game, toHand(game, "Sol Ring"));
    expect(named0(game, "Sol Ring")).toBe(true);

    const { game: g2 } = table();
    spawn(g2, "Sage of the Unknowable");
    spawn(g2, "Forest");
    expect(() => cast(g2, toHand(g2, "Grizzly Bears"))).toThrow();
  });

  it("its {C} pays for an ability (Fowl Strike's reinforce)", () => {
    const { game } = table();
    spawn(game, "Sage of the Unknowable");
    spawn(game, "Sage of the Unknowable");
    spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    const strike = toHand(game, "Fowl Strike");
    activate(game, strike, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Fowl Strike", () => {
  it("destroys a creature with flying, and can't target one without", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const strike = toHand(game, "Fowl Strike");
    expect(() => cast(game, strike, { targets: [ref(bears)] })).toThrow();
    cast(game, strike, { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
  });

  it("reinforce 2 discards it to put two +1/+1 counters on a creature", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const strike = toHand(game, "Fowl Strike");
    activate(game, strike, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    expect(zone(game, strike)).toBe("graveyard");
  });
});

describe("Thriving Skyclaw", () => {
  it("gets {E}{E}{E}; attacking, {E}{E}{E} puts a +1/+1 counter on it", () => {
    const { game, a } = table();
    const claw = enter(game, "Thriving Skyclaw");
    expect(energy(game)).toBe(3);
    pickModes(a, 0);
    attack(game, a, [claw]);
    expect(counters(game, claw)).toBe(1);
    expect(energy(game)).toBe(0);
    expect(life(game, B)).toBe(16);
  });

  it("with fewer than three energy it isn't offered", () => {
    const { game, a } = table();
    const claw = enter(game, "Thriving Skyclaw");
    setEnergy(game, 2);
    pickModes(a, 0);
    attack(game, a, [claw]);
    expect(counters(game, claw)).toBe(0);
    expect(energy(game)).toBe(2);
  });
});

describe("Skoa, Embermage", () => {
  it("entering deals 4 damage to any target", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Skoa, Embermage");
    expect(life(game, B)).toBe(16);
  });

  it("grandeur: discard another Skoa and sacrifice two Mountains for 4 more damage", () => {
    const { game } = table();
    const skoa = spawn(game, "Skoa, Embermage");
    const mountains = lands(game, "Mountain", 2);
    expect(() => activate(game, skoa, 0, { targets: [ref(B)] })).toThrow();
    const other = toHand(game, "Skoa, Embermage");
    activate(game, skoa, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, other)).toBe("graveyard");
    expect(mountains.map((m) => zone(game, m))).toEqual(["graveyard", "graveyard"]);
  });
});

describe("Solstice Zealot", () => {
  it("gets {E}{E}; {T}, pay {E} taps a creature — not with no energy", () => {
    const { game } = table();
    const zealot = enter(game, "Solstice Zealot");
    expect(energy(game)).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, zealot, 0, { targets: [ref(bears)] });
    expect(isTapped(game, bears)).toBe(true);
    expect(energy(game)).toBe(1);

    const { game: g2 } = table();
    const z2 = spawn(g2, "Solstice Zealot");
    const b2 = spawn(g2, "Grizzly Bears", B);
    expect(() => activate(g2, z2, 0, { targets: [ref(b2)] })).toThrow();
  });
});

describe("Hexgold Slith", () => {
  it("gets {E}{E}; attacking, {E}{E} gives it first strike, and its combat damage to a player grows it", () => {
    const { game, a } = table();
    const slith = enter(game, "Hexgold Slith");
    expect(energy(game)).toBe(2);
    pickModes(a, 0);
    attack(game, a, [slith]);
    expect(energy(game)).toBe(0);
    expect(keywords(game, slith).has("first-strike")).toBe(true);
    expect(counters(game, slith)).toBe(1);
    expect(life(game, B)).toBe(18);
  });
});

describe("Expel the Unworthy", () => {
  it("exiles a creature with mana value 3 or less and its controller gains that much life", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const expel = toHand(game, "Expel the Unworthy");
    expect(() => cast(game, expel, { targets: [ref(wurm)] })).toThrow();
    cast(game, expel, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(22);
  });

  it("kicked, it exiles any creature", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Expel the Unworthy"), { targets: [ref(wurm)], kicked: true });
    expect(zone(game, wurm)).toBe("exile");
    expect(life(game, B)).toBe(26);
  });

  it("reads the mana value as the creature last existed: a face-down one gives 0", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const wurm = toLibrary(game, "Craw Wurm", B);
    game.debugApplyEffect(B, { kind: "manifest", who: "you" });
    settle(game);
    expect(zone(game, wurm)).toBe("battlefield");
    cast(game, toHand(game, "Expel the Unworthy"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });
});

describe("Electrozoa", () => {
  it("gets {E}{E}; at your first main phase, {E} keeps it untapped", () => {
    const { game, a } = table();
    const zoa = enter(game, "Electrozoa");
    expect(energy(game)).toBe(2);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    expect(isTapped(game, zoa)).toBe(false);
    expect(energy(game)).toBe(1);
  });

  it("declined, or with no energy, it's tapped", () => {
    const { game, a } = table();
    const zoa = enter(game, "Electrozoa");
    pickModes(a);
    toStep(game, "precombat-main");
    settle(game);
    expect(isTapped(game, zoa)).toBe(true);
    expect(energy(game)).toBe(2);

    const { game: g2, a: a2 } = table();
    const z2 = spawn(g2, "Electrozoa");
    pickModes(a2, 0);
    toStep(g2, "precombat-main");
    settle(g2);
    expect(isTapped(g2, z2)).toBe(true);
  });
});
