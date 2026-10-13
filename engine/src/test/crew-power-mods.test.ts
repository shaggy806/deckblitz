/**
 * Crew and saddle power modifiers (`StaticAbility.crewsAs`): "This creature
 * crews Vehicles [and saddles Mounts] as though its power were 2 greater"
 * and "…using its toughness rather than its power" (rules 702.122a,
 * 702.171a). The modified value is what the crew/saddle offer's `power`
 * says and what the cost sums; teamwork (702.194a) and the creature's own
 * power never see it, and it's gone once the creature loses its abilities.
 */
import { describe, expect, it } from "vitest";

import type { Action, TapCostOffer } from "../actions.js";
import { tapPicksPower } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, lands, pt, ref, settle, spawn, table, toHand, types } from "./harness.js";

/** `source`'s activated ability `index` as offered, with its tap cost. */
function tapOffer(game: Game, source: ObjectId, index = 0): TapCostOffer {
  const offer = game
    .legalActions(A)
    .find((o) => o.kind === "activate-ability" && o.source === source && o.abilityIndex === index);
  if (offer === undefined || offer.kind !== "activate-ability" || offer.tapCost === undefined) {
    throw new Error("no tap-cost offer");
  }
  return offer.tapCost;
}

const offered = (game: Game, source: ObjectId, index = 0): boolean =>
  game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === source && o.abilityIndex === index);

/** Activate `source`'s ability `index` tapping `tap`: the engine's refusal,
 * or null once it has resolved. */
function payWith(game: Game, source: ObjectId, tap: readonly ObjectId[], index = 0): string | null {
  const action: Action = { type: "activate-ability", player: A, source, abilityIndex: index, targets: [], tap };
  const why = game.canDispatch(action);
  if (why === null) {
    game.dispatch(action);
    settle(game);
  }
  return why;
}

describe("crews Vehicles as though its power were 2 greater", () => {
  it("adds 2 to what the creature crews with, and only there — its power stays its own", () => {
    const { game } = table();
    const caravan = spawn(game, "Cultivator's Caravan"); // crew 3 is ability 1
    const mechanic = spawn(game, "Hotshot Mechanic"); // 2/1
    const offer = tapOffer(game, caravan, 1);
    expect(offer.power).toEqual({ [mechanic]: 4 });
    expect(tapPicksPower(offer, [mechanic])).toBe(4);
    expect(payWith(game, caravan, [mechanic], 1)).toBeNull();
    expect(types(game, caravan)).toContain("creature");
    expect(pt(game, mechanic)).toEqual({ power: 2, toughness: 1 });
  });

  it("a Pilot token whose power is 0 still crews a Crew 2 Vehicle alone", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const prototype = spawn(game, "Prodigy's Prototype"); // crew 2
    const pilot = spawn(game, "Pilot Token (Crews Vehicles)"); // 1/1
    cast(game, toHand(game, "Fleeting Distraction"), { targets: [ref(pilot)] }); // -1/-0
    expect(pt(game, pilot).power).toBe(0);
    expect(tapOffer(game, prototype).power).toEqual({ [pilot]: 2 });
    expect(payWith(game, prototype, [pilot])).toBeNull();
    expect(types(game, prototype)).toContain("creature");
    expect(game.state.objects[pilot].tapped).toBe(true);
  });

  it("crew only, unless it says 'saddles Mounts': the NEO Pilot saddles with its power, the Aetherdrift one with 2 more", () => {
    const { game } = table();
    const newt = spawn(game, "Archmage's Newt"); // saddle 3
    const crewsOnly = spawn(game, "Pilot Token (Crews Vehicles)");
    const both = spawn(game, "Pilot Token");
    const offer = tapOffer(game, newt);
    expect(offer.power).toEqual({ [crewsOnly]: 1, [both]: 3 });
    // The Aetherdrift Pilot alone pays saddle 3; the NEO one alone can't.
    expect(payWith(game, newt, [crewsOnly])).not.toBeNull();
    expect(payWith(game, newt, [both])).toBeNull();
    expect(game.state.objects[newt].saddled).toBe(true);
  });

  it("saddles Mounts as though its power were 2 greater: Dynamite Diver (1/1) saddles a Saddle 3 alone", () => {
    const { game } = table();
    const beaver = spawn(game, "Giant Beaver"); // saddle 3
    const diver = spawn(game, "Dynamite Diver");
    expect(tapOffer(game, beaver).power).toEqual({ [diver]: 3 });
    expect(payWith(game, beaver, [diver])).toBeNull();
    expect(game.state.objects[beaver].saddled).toBe(true);
    expect(pt(game, diver).power).toBe(1);
  });

  it("never reaches teamwork: HULK SMASH!'s offer reads each creature's real power", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const smash = toHand(game, "HULK SMASH!"); // teamwork 4
    // Something for each of its modes to target.
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Sol Ring", B);
    const mechanic = spawn(game, "Hotshot Mechanic");
    const pilot = spawn(game, "Pilot Token");
    const kicked = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === smash && o.kicked === true);
    // 2 + 1 = 3 real power: short of teamwork's 4, though they'd crew for 4 + 3.
    expect(kicked).toBeUndefined();
    spawn(game, "Llanowar Elves");
    const now = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === smash && o.kicked === true);
    expect(now?.kind === "cast-spell" ? now.tapCost?.power : undefined).toMatchObject({ [mechanic]: 2, [pilot]: 1 });
  });

  it("is lost with the creature's abilities: a Frogged Dynamite Diver crews with its own power", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const caravan = spawn(game, "Cultivator's Caravan");
    const diver = spawn(game, "Dynamite Diver");
    const bears = spawn(game, "Grizzly Bears");
    expect(tapOffer(game, caravan, 1).power).toEqual({ [diver]: 3, [bears]: 2 });
    cast(game, toHand(game, "Turn to Frog"), { targets: [ref(diver)] });
    expect(tapOffer(game, caravan, 1).power).toEqual({ [diver]: 1, [bears]: 2 });
    expect(payWith(game, caravan, [diver], 1)).not.toBeNull();
    expect(payWith(game, caravan, [diver, bears], 1)).toBeNull();
  });
});

describe("crews Vehicles using its toughness rather than its power", () => {
  it("Giant Ox (0/6) crews a Crew 3 alone with its toughness, but saddles with its power", () => {
    const { game } = table();
    const caravan = spawn(game, "Cultivator's Caravan");
    const newt = spawn(game, "Archmage's Newt");
    const ox = spawn(game, "Giant Ox");
    expect(tapOffer(game, caravan, 1).power).toEqual({ [ox]: 6, [newt]: 2 });
    // Saddle: not "saddles Mounts", so its power (0) — the Newt's saddle isn't payable.
    expect(offered(game, newt)).toBe(false);
    expect(payWith(game, caravan, [ox], 1)).toBeNull();
    expect(types(game, caravan)).toContain("creature");
    expect(pt(game, ox)).toEqual({ power: 0, toughness: 6 });
  });

  it("Interface Ace (0/4) saddles and crews with its toughness, and untaps once during your turn", () => {
    const { game } = table();
    const newt = spawn(game, "Archmage's Newt"); // saddle 3
    const ace = spawn(game, "Interface Ace");
    expect(tapOffer(game, newt).power).toEqual({ [ace]: 4 });
    expect(payWith(game, newt, [ace])).toBeNull();
    expect(game.state.objects[newt].saddled).toBe(true);
    // Tapped during its controller's turn: it untaps (once each turn).
    expect(game.state.objects[ace].tapped).toBe(false);
    const caravan = spawn(game, "Cultivator's Caravan");
    expect(payWith(game, caravan, [ace], 1)).toBeNull();
    expect(game.state.objects[ace].tapped).toBe(true);
  });
});
