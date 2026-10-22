/**
 * Ice Age, group H: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  type BlockOffer,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

function activateSacrificing(game: Game, source: ObjectId, sacrifice: ObjectId): void {
  const action = { type: "activate-ability" as const, player: A, source, abilityIndex: 0, targets: [], sacrifice };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(`activate refused: ${why}`);
  game.dispatch(action);
  settle(game);
}

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Despotic Scepter", () => {
  it("destroys only a permanent you own", () => {
    const { game } = table();
    const scepter = spawn(game, "Despotic Scepter");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, scepter, 0, { targets: [ref(theirs)] })).toThrow();
    activate(game, scepter, 0, { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Hydroblast", () => {
  it("destroys a red permanent and leaves a nonred one alone", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hydroblast"), { modes: [1], targets: [ref(goblin)] });
    cast(game, toHand(game, "Hydroblast"), { modes: [1], targets: [ref(bears)] });
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Soul Barrier", () => {
  it("deals 2 damage to the caster of a creature spell unless they pay {2}", () => {
    const { game, b } = table();
    spawn(game, "Soul Barrier");
    lands(game, "Wastes", 2, B);
    nextTurn(game);
    pickModes(b);
    cast(game, toHand(game, "Memnite", B), { player: B });
    expect(life(game, B)).toBe(18);
    pickModes(b, 0);
    cast(game, toHand(game, "Memnite", B), { player: B });
    expect(life(game, B)).toBe(18);
  });
});

describe("Glacial Crevasses", () => {
  it("sacrifices only a snow Mountain, and prevents combat damage", () => {
    const { game, a } = table();
    const crevasses = spawn(game, "Glacial Crevasses");
    const mountain = spawn(game, "Mountain");
    const snowy = spawn(game, "Snow-Covered Mountain");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activateSacrificing(game, crevasses, mountain)).toThrow();
    activateSacrificing(game, crevasses, snowy);
    expect(zone(game, snowy)).toBe("graveyard");
    expect(zone(game, mountain)).toBe("battlefield");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Drift of the Dead", () => {
  it("counts only snow lands", () => {
    const { game } = table();
    const drift = spawn(game, "Drift of the Dead");
    lands(game, "Snow-Covered Swamp", 2);
    lands(game, "Swamp", 1);
    spawn(game, "Snow-Covered Swamp", B);
    expect(pt(game, drift)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("White Scarab", () => {
  it("gets +2/+2 only while an opponent controls a white permanent, and white creatures can't block it", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "White Scarab"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const knight = spawn(game, "White Knight", B);
    const blocker = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, knight)).toEqual([]);
    expect(canBlock(offer, blocker)).toEqual([bears]);
  });
});

describe("Lapis Lazuli Talisman", () => {
  it("untaps the target permanent when its controller pays {3} as a blue spell is cast", () => {
    const { game, a } = table();
    spawn(game, "Lapis Lazuli Talisman");
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Opt"));
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Curse of Marit Lage", () => {
  it("taps every Island as it enters, and they stay tapped", () => {
    const { game } = table();
    const islands = lands(game, "Island", 2, B);
    const forest = spawn(game, "Forest", B, { tapped: true });
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Curse of Marit Lage"));
    expect(islands.every((id) => tapped(game, id))).toBe(true);
    nextTurn(game);
    expect(islands.every((id) => tapped(game, id))).toBe(true);
    expect(tapped(game, forest)).toBe(false);
  });
});

describe("Monsoon", () => {
  it("taps the active player's untapped Islands and deals that much damage", () => {
    const { game } = table();
    spawn(game, "Monsoon", B);
    const islands = lands(game, "Island", 2);
    spawn(game, "Island", A, { tapped: true });
    const bobs = spawn(game, "Island", B);
    toStep(game, "end");
    settle(game);
    expect(islands.every((id) => tapped(game, id))).toBe(true);
    expect(life(game, A)).toBe(18);
    expect(tapped(game, bobs)).toBe(false);
    expect(life(game, B)).toBe(20);
  });
});

describe("Snow Hound", () => {
  it("returns itself and the green or blue creature together", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const hound = spawn(game, "Snow Hound");
    const elves = spawn(game, "Llanowar Elves");
    const lions = spawn(game, "Savannah Lions");
    expect(() => activate(game, hound, 0, { targets: [ref(lions)] })).toThrow();
    activate(game, hound, 0, { targets: [ref(elves)] });
    expect(zone(game, hound)).toBe("hand");
    expect(zone(game, elves)).toBe("hand");
  });
});

describe("Balduvian Hydra", () => {
  it("enters with X +1/+0 counters, spends one to prevent 1 damage, and grows only in your upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const hydra = toHand(game, "Balduvian Hydra");
    cast(game, hydra, { x: 3 });
    expect(counters(game, hydra, "+1/+0")).toBe(3);
    expect(pt(game, hydra)).toEqual({ power: 3, toughness: 1 });
    activate(game, hydra, 0);
    expect(counters(game, hydra, "+1/+0")).toBe(2);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(hydra)]);
    settle(game);
    expect(zone(game, hydra)).toBe("battlefield");
    expect(() => activate(game, hydra, 1)).toThrow();
  });
});

describe("Goblin Sappers", () => {
  it("makes the creature unblockable, then destroys it and the Sappers at end of combat", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const sappers = spawn(game, "Goblin Sappers");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    activate(game, sappers, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, wall)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, sappers)).toBe("graveyard");
  });
});

describe("Goblin Ski Patrol", () => {
  it("gets +2/+0 and flying, only once, and is sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Snow-Covered Mountain");
    const patrol = spawn(game, "Goblin Ski Patrol");
    activate(game, patrol, 0);
    expect(pt(game, patrol)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, patrol).has("flying")).toBe(true);
    expect(() => activate(game, patrol, 0)).toThrow();
    toStep(game, "end");
    settle(game);
    expect(zone(game, patrol)).toBe("graveyard");
  });

  it("can't be activated without a snow Mountain", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const patrol = spawn(game, "Goblin Ski Patrol");
    expect(() => activate(game, patrol, 0)).toThrow();
  });
});

describe("Battle Frenzy", () => {
  it("gives green creatures +1/+1 and nongreen ones +1/+0", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const elves = spawn(game, "Llanowar Elves");
    const lions = spawn(game, "Savannah Lions");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Battle Frenzy"));
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});
