/**
 * Kicker costs that aren't mana (rule 702.33a: "Kicker [cost]" is any cost,
 * paid as additional costs are, 601.2b and 601.2f–h) — a sacrifice (Vicious
 * Offering, Goblin Barrage; entwine's too, Betrayal of Flesh), returning a
 * permanent to its owner's hand (Arctic Merfolk) and tapping an untapped
 * permanent (Blood Tribute) — and a life cost per target (Phyrexian Purge,
 * rule 601.2f).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, hand, lands, life, pt, ref, spawn, table, toHand, zone } from "./harness.js";

const castsOf = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

const kickedOffer = (game: Game, card: ObjectId) => castsOf(game, card).find((a) => a.kicked === true);

describe("Vicious Offering — kicker: sacrifice a creature", () => {
  it("is offered kicked only with a creature to sacrifice, and kicked gives -5/-5", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    const offering = toHand(game, "Vicious Offering");
    expect(kickedOffer(game, offering)).toBeUndefined();
    const bears = spawn(game, "Grizzly Bears");
    expect(kickedOffer(game, offering)).toBeDefined();
    cast(game, offering, { targets: [ref(giant)], kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("unkicked gives -2/-2 and sacrifices nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Vicious Offering"), { targets: [ref(giant)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Goblin Barrage — kicker: sacrifice an artifact or Goblin", () => {
  it("kicked by sacrificing an artifact, it also deals 4 to a second target", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const barrage = toHand(game, "Goblin Barrage");
    // A creature that's neither an artifact nor a Goblin can't pay it.
    expect(kickedOffer(game, barrage)).toBeUndefined();
    const stone = spawn(game, "Mind Stone");
    expect(kickedOffer(game, barrage)).toBeDefined();
    cast(game, barrage, { targets: [ref(giant), ref(B)], kicked: true });
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });
});

describe("Betrayal of Flesh — entwine: sacrifice three lands", () => {
  it("entwined, it sacrifices three lands and does both", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 6);
    const extra = lands(game, "Wastes", 3);
    const giant = spawn(game, "Hill Giant", B);
    const dead = game.debugSpawn("Grizzly Bears", A, "graveyard");
    const betrayal = toHand(game, "Betrayal of Flesh");
    expect(kickedOffer(game, betrayal)).toBeDefined();
    cast(game, betrayal, { modes: [0, 1], targets: [ref(giant), ref(dead)], kicked: true });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, dead)).toBe("battlefield");
    expect([...swamps, ...extra].filter((id) => zone(game, id) === "graveyard")).toHaveLength(3);
  });

  it("isn't offered entwined with fewer than three lands besides", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears");
    const betrayal = toHand(game, "Betrayal of Flesh");
    expect(kickedOffer(game, betrayal)).toBeUndefined();
  });
});

describe("Arctic Merfolk — kicker: return a creature you control to its owner's hand", () => {
  it("kicked, it returns the creature and enters with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const merfolk = toHand(game, "Arctic Merfolk");
    expect(kickedOffer(game, merfolk)).toBeUndefined();
    const bears = spawn(game, "Grizzly Bears");
    expect(kickedOffer(game, merfolk)).toBeDefined();
    cast(game, merfolk, { kicked: true });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game)).toContain(bears);
    expect(zone(game, merfolk)).toBe("battlefield");
    expect(counters(game, merfolk)).toBe(1);
  });

  it("unkicked, it enters with no counter", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const merfolk = toHand(game, "Arctic Merfolk");
    cast(game, merfolk);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, merfolk)).toBe(0);
  });
});

describe("Blood Tribute — kicker: tap an untapped Vampire you control", () => {
  it("kicked, it taps a Vampire (summoning sick or not) and gains the life lost", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const tribute = toHand(game, "Blood Tribute");
    expect(kickedOffer(game, tribute)).toBeUndefined();
    const vampire = spawn(game, "Vampire Nighthawk", A, { sick: true });
    const offer = kickedOffer(game, tribute);
    expect(offer?.tapCost?.choices).toEqual([vampire]);
    cast(game, tribute, { targets: [ref(B)], kicked: true, tap: [vampire] });
    expect(game.state.objects[vampire].tapped).toBe(true);
    expect(life(game, B)).toBe(10);
    expect(life(game, A)).toBe(30);
  });

  it("unkicked, nothing is tapped and no life is gained", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const vampire = spawn(game, "Vampire Nighthawk");
    cast(game, toHand(game, "Blood Tribute"), { targets: [ref(B)] });
    expect(game.state.objects[vampire].tapped).toBe(false);
    expect(life(game, B)).toBe(10);
    expect(life(game, A)).toBe(20);
  });
});

describe("Phyrexian Purge — 3 life more for each target", () => {
  it("costs 3 life per creature targeted, and destroys them", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const giants = [spawn(game, "Hill Giant", B), spawn(game, "Hill Giant", B)];
    cast(game, toHand(game, "Phyrexian Purge"), { targets: giants.map(ref) });
    expect(giants.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(life(game, A)).toBe(14);
  });

  it("offers only as many targets as the caster's life pays for", () => {
    const { game } = table({ life: 7 });
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const giants = [spawn(game, "Hill Giant", B), spawn(game, "Hill Giant", B), spawn(game, "Hill Giant", B)];
    const purge = toHand(game, "Phyrexian Purge");
    const [offer] = castsOf(game, purge);
    expect(offer?.targetCount).toMatchObject({ min: 0, max: 2 });
    expect(() => cast(game, purge, { targets: giants.map(ref) })).toThrow(/life/);
  });
});
