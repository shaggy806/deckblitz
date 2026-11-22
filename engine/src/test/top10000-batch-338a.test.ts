/**
 * Batch 338 (author-top-cards overnight, combat-targeting lane):
 * - Tilonalli's Crown and Fatal Attraction: an Aura's untargeted damage to
 *   the creature it enchants (`damage` `target: "attached"`, Earthbind's).
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics, invalidateComputedCache } from "../characteristics.js";
import type { ScriptedController } from "../controller.js";
import {
  B,
  activate,
  cast,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Tilonalli's Crown", () => {
  it("deals 1 damage to the creature it enchants, which gets +3/+0 and trample", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Tilonalli's Crown"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 3 });
    expect(keywords(game, giant).has("trample")).toBe(true);
  });

  it("kills an X/1 it enchants", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Tilonalli's Crown"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Mana Maze", () => {
  it("stops a spell sharing a color with the last spell cast this turn, even once that resolved", () => {
    const { game } = table();
    spawn(game, "Mana Maze", B);
    const start = life(game, B);
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(B)] })).toThrow();
    // Blue shares nothing with red; then red is fine again and blue isn't.
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(start - 5);
  });

  it("restricts nothing before the turn's first spell, nor after a colorless one", () => {
    const { game } = table();
    spawn(game, "Mana Maze", B);
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    nextTurn(game);
    nextTurn(game);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    cast(game, toHand(game, "Sol Ring"));
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] })).not.toThrow();
  });
});

describe("Evolving Door", () => {
  const acceptCastNow = (seat: ScriptedController): void => {
    seat.chooseCastNowFn = (_view, offer) =>
      offer.cards[0] === undefined ? null : { type: "cast-spell", player: seat.playerId, card: offer.cards[0], targets: [], via: "effect" };
  };

  it("finds a creature card one color more than the sacrificed creature, exiles it and casts it, paying", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const door = spawn(game, "Evolving Door");
    const bears = spawn(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const wolf = toLibrary(game, "Watchwolf");
    const seen = pickFromZone(a, wolf);
    acceptCastNow(a);
    activate(game, door, 0, { sacrifice: bears });
    expect(seen.offered).toEqual([wolf]);
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, wolf)).toBe("battlefield");
  });

  it("asks a colorless sacrifice for a monocolored card, which stays exiled if not cast", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const door = spawn(game, "Evolving Door");
    const thopter = spawn(game, "Ornithopter");
    const giant = toLibrary(game, "Hill Giant");
    const wolf = toLibrary(game, "Watchwolf");
    const seen = pickFromZone(a, giant);
    activate(game, door, 0, { sacrifice: thopter });
    expect(seen.offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, wolf)).toBe("library");
  });
});

describe("Invasion of Pyrulea // Gargantuan Slabhorn", () => {
  it("scries 3, then draws if the revealed top card is a land", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Forest");
    const before = hand(game).length;
    cast(game, toHand(game, "Invasion of Pyrulea"));
    expect(hand(game).length).toBe(before + 1);
  });

  it("draws for a double-faced card, not for a single-faced creature", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Delver of Secrets");
    const before = hand(game).length;
    cast(game, toHand(game, "Invasion of Pyrulea"));
    expect(hand(game).length).toBe(before + 1);

    const other = table();
    lands(other.game, "Forest", 1);
    lands(other.game, "Island", 1);
    for (let i = 0; i < 4; i += 1) toLibrary(other.game, "Grizzly Bears");
    const was = hand(other.game).length;
    cast(other.game, toHand(other.game, "Invasion of Pyrulea"));
    expect(hand(other.game).length).toBe(was);
  });

  it("gives other transformed permanents you control trample, not front-faced or opponents' ones", () => {
    const { game } = table();
    const slabhorn = spawn(game, "Invasion of Pyrulea");
    const aberration = spawn(game, "Delver of Secrets");
    const delver = spawn(game, "Delver of Secrets");
    const theirs = spawn(game, "Delver of Secrets", B);
    for (const id of [slabhorn, aberration, theirs]) game.state.objects[id].face = 1;
    invalidateComputedCache();
    expect(computeCharacteristics(game.state, game.registry, slabhorn).power).toBe(4);
    expect(keywords(game, slabhorn).has("trample")).toBe(true);
    expect(keywords(game, aberration).has("trample")).toBe(true);
    expect(keywords(game, delver).has("trample")).toBe(false);
    expect(keywords(game, theirs).has("trample")).toBe(false);
    // Turned back to its front face, it's no longer transformed (701.27g).
    game.state.objects[aberration].face = 0;
    invalidateComputedCache();
    expect(keywords(game, aberration).has("trample")).toBe(false);
  });
});

describe("Fatal Attraction", () => {
  it("deals 2 as it enters and 4 at its controller's upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Fatal Attraction"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    nextTurn(game); // Bob's turn: no upkeep trigger, and the damage wore off.
    expect(zone(game, wurm)).toBe("battlefield");
    nextTurn(game); // Alice's upkeep: 4 damage to a 6/4.
    expect(zone(game, wurm)).toBe("graveyard");
  });
});
