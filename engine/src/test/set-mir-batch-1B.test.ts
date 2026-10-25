/**
 * Mirage (MIR; B166), group B. One test per card whose behaviour is more than
 * a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,

  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";
import type { ObjectId } from "../primitives.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Dream Cache", () => {
  it("draws three, then puts the two chosen cards on the bottom when that's the choice", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const marker = toLibrary(game, "Wastes");
    const bears = toHand(game, "Grizzly Bears");
    const drake = toHand(game, "Wind Drake");
    const cache = toHand(game, "Dream Cache");
    const before = hand(game).length;
    pickModes(a, 1);
    pickFromZone(a, bears, drake);
    cast(game, cache);
    // -1 (the cast) +3 (drawn) -2 (put back).
    expect(hand(game).length).toBe(before);
    const library = game.state.zones.perPlayer[A].library;
    // The top is index 0: the marker on top was drawn, and the two chosen
    // cards are at the very bottom.
    expect(zone(game, marker)).toBe("hand");
    expect([...library.slice(-2)].sort()).toEqual([bears, drake].sort());
  });
});

describe("Sapphire Charm", () => {
  it("has the target player draw at the beginning of the next turn's upkeep", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const charm = toHand(game, "Sapphire Charm");
    const before = hand(game, B).length;
    cast(game, charm, { modes: [0], targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before);
    nextTurn(game);
    settle(game);
    // Bob's draw step plus the charm's draw.
    expect(hand(game, B).length).toBe(before + 2);
  });
});

describe("Chaosphere", () => {
  it("lets fliers block only fliers, and gives everything else reach", () => {
    const { game, a } = table();
    spawn(game, "Chaosphere");
    const bears = spawn(game, "Grizzly Bears");
    const drake = spawn(game, "Wind Drake");
    const theirDrake = spawn(game, "Wind Drake", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [bears, drake]);
    expect(canBlock(offer, theirDrake)).toEqual([drake]);
    expect([...canBlock(offer, theirBears)].sort()).toEqual([bears, drake].sort());
  });
});

describe("Infernal Contract", () => {
  it("draws four and loses half the life total, rounded up", () => {
    const { game } = table({ life: 15 });
    lands(game, "Swamp", 3);
    const contract = toHand(game, "Infernal Contract");
    const before = hand(game).length;
    cast(game, contract);
    expect(hand(game).length).toBe(before - 1 + 4);
    expect(life(game)).toBe(7);
  });
});

describe("Floodgate", () => {
  it("is sacrificed once it has flying, and deals half the Islands (rounded down) to each nonblue non-flier", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const gate = spawn(game, "Floodgate");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const drake = spawn(game, "Wind Drake", B);
    const merfolk = spawn(game, "Merfolk of the Pearl Trident", B);
    // A real spell grants it flying (Jump), so the game looks for the state
    // trigger as it would at the table.
    const jump = toHand(game, "Jump");
    cast(game, jump, { targets: [ref(gate)] });
    expect(zone(game, gate)).toBe("graveyard");
    // 5 Islands → 2 damage: the 2/2 dies, the 3/3 lives.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(zone(game, drake)).toBe("battlefield");
    expect(zone(game, merfolk)).toBe("battlefield");
  });
});

describe("Zuberi, Golden Feather", () => {
  it("pumps other Griffins, anyone's, but not itself", () => {
    const { game } = table();
    const zuberi = spawn(game, "Zuberi, Golden Feather");
    const mine = spawn(game, "Griffin Sentinel");
    const theirs = spawn(game, "Griffin Sentinel", B);
    expect(pt(game, zuberi)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Choking Sands", () => {
  it("destroys a nonbasic land and deals 2 damage to its controller", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Strip Mine", B);
    const sands = toHand(game, "Choking Sands");
    cast(game, sands, { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("deals no damage for a basic land", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const [forest] = lands(game, "Forest", 1, B);
    const sands = toHand(game, "Choking Sands");
    cast(game, sands, { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Hammer of Bogardan", () => {
  it("returns from the graveyard only during its owner's upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const hammer = toGraveyard(game, "Hammer of Bogardan");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: hammer, abilityIndex: 0, targets: [] })).not.toBeNull();
    toStep(game, "upkeep");
    activate(game, hammer);
    expect(zone(game, hammer)).toBe("hand");
    expect(graveyard(game)).not.toContain(hammer);
    expect(named(game, "Hammer of Bogardan")).toEqual([]);
  });
});
