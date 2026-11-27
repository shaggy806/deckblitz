/**
 * A choice of costs on an activated ability (`AbilityCost.options`) where a
 * branch is mana: Tidal Control's "Pay 2 life or {2}: Counter target red or
 * green spell. Any player may activate this ability." The branch is chosen
 * as it's activated (rule 602.2b); its `mana` takes the place of the
 * ability's `mana: null`, and whoever activates it pays (602.2a).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;
const offers = (game: Game, source: ObjectId, player: PlayerId = A): Offer[] =>
  game.legalActions(player).filter((l): l is Offer => l.kind === "activate-ability" && l.source === source);

describe("Tidal Control: pay 2 life or {2}", () => {
  it("offers the mana branch only with the mana to pay it, and pays it", () => {
    const { game } = table();
    const control = spawn(game, "Tidal Control");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(offers(game, control).map((o) => o.costOption)).toEqual([0]);
    const islands = lands(game, "Island", 2);
    const both = offers(game, control);
    expect(both.map((o) => o.costOption)).toEqual([0, 1]);
    expect(both[1].costOptionText).toBe("{2}");
    game.dispatch({ type: "activate-ability", player: A, source: control, abilityIndex: 0, costOption: 1, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    for (const id of islands) expect(game.state.objects[id].tapped).toBe(true);
  });

  it("the life branch pays 2 life and no mana", () => {
    const { game } = table();
    const control = spawn(game, "Tidal Control");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.dispatch({ type: "activate-ability", player: A, source: control, abilityIndex: 0, costOption: 0, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });

  it("any player may activate it, paying the cost themselves", () => {
    const { game } = table();
    const control = spawn(game, "Tidal Control", B);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const islands = lands(game, "Island", 2);
    expect(offers(game, control).map((o) => o.costOption)).toEqual([0, 1]);
    game.dispatch({ type: "activate-ability", player: A, source: control, abilityIndex: 0, costOption: 1, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    for (const id of islands) expect(game.state.objects[id].tapped).toBe(true);
    expect(life(game, B)).toBe(20);
  });

  it("can't counter a spell that isn't red or green", () => {
    const { game } = table();
    const control = spawn(game, "Tidal Control");
    lands(game, "Island", 2);
    const tutor = toHand(game, "Opt");
    cast(game, tutor, { settle: false });
    expect(offers(game, control)).toEqual([]);
  });
});
