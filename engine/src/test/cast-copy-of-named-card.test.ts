/**
 * `cast-now`'s `copyOfCardNamed`, paid and made outside the game (rules
 * 707.12, 707.13) — Garth One-Eye: "Choose a card name that hasn't been
 * chosen from among Disenchant, Braingeyser, Terror, Shivan Dragon,
 * Regrowth, and Black Lotus. Create a copy of the card with the chosen name.
 * You may cast the copy. (You still pay its costs.)"
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameObject } from "../state.js";
import type { TargetRef } from "../target.js";
import { changeDefinitionText } from "../text-change.js";
import { A, B, activate, lands, ref, spawn, table, zone } from "./harness.js";

/** Choose `name` among the names offered; records what was offered. */
function naming(seat: ScriptedController, name: string): string[][] {
  const offered: string[][] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    offered.push([...texts]);
    return [texts.indexOf(name)];
  };
  return offered;
}

/** Cast the copy offered (paying for it), or decline; records the offers. */
function casting(seat: ScriptedController, yes: boolean, targets: readonly TargetRef[] = []): string[] {
  const offers: string[] = [];
  seat.chooseCastNowFn = (_view, offer) => {
    offers.push(offer.casts[0].cardName);
    return yes
      ? { type: "cast-spell", player: seat.playerId, card: offer.casts[0].card, targets: [...targets], via: offer.casts[0].via }
      : null;
  };
  return offers;
}

const named = (game: Game, name: string): GameObject[] =>
  Object.values(game.state.objects).filter((o) => o.cardName === name);

const untap = (game: Game, id: ObjectId): void => {
  game.state.objects[id].tapped = false;
};

describe("Garth One-Eye", () => {
  it("casts a copy of Shivan Dragon, paying for it; it resolves into a token", () => {
    const { game, a } = table();
    const garth = spawn(game, "Garth One-Eye", A);
    lands(game, "Mountain", 6);
    naming(a, "Shivan Dragon");
    const offers = casting(a, true);
    activate(game, garth);
    expect(offers).toEqual(["Shivan Dragon"]);
    const dragons = Object.values(game.state.objects).filter((o) => o.cardName === "Shivan Dragon");
    expect(dragons).toHaveLength(1);
    expect(dragons[0].zone).toBe("battlefield");
    expect(dragons[0].isToken).toBe(true);
    expect(dragons[0].controller).toBe(A);
    // Its {4}{R}{R} was paid.
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Mountain" && game.state.objects[id].tapped)).toHaveLength(6);
  });

  it("casts a copy of Terror at a target, paying {1}{B}", () => {
    const { game, a } = table();
    const garth = spawn(game, "Garth One-Eye", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    naming(a, "Terror");
    casting(a, true, [ref(bears)]);
    activate(game, garth);
    expect(zone(game, bears)).toBe("graveyard");
    // The copy ceased to exist leaving the stack: nothing named Terror is left.
    expect(named(game, "Terror")).toHaveLength(0);
  });

  it("a name chosen isn't offered again, even if the copy wasn't cast; the copy is gone", () => {
    const { game, a } = table();
    const garth = spawn(game, "Garth One-Eye", A);
    const offered = naming(a, "Black Lotus");
    casting(a, false);
    activate(game, garth);
    expect(offered[0]).toHaveLength(6);
    expect(named(game, "Black Lotus")).toHaveLength(0);
    expect(game.state.outside?.[A] ?? []).toHaveLength(0);
    untap(game, garth);
    naming(a, "Regrowth");
    const second = naming(a, "Regrowth");
    activate(game, garth);
    expect(second[0]).not.toContain("Black Lotus");
    expect(second[0]).toHaveLength(5);
  });

  it("nothing is offered when the copy can't be paid for", () => {
    const { game, a } = table();
    const garth = spawn(game, "Garth One-Eye", A);
    naming(a, "Shivan Dragon");
    const offers = casting(a, true);
    activate(game, garth);
    expect(offers).toEqual([]);
    expect(named(game, "Shivan Dragon")).toHaveLength(0);
  });

  it("a copy of Black Lotus is cast for nothing and becomes a token", () => {
    const { game, a } = table();
    const garth = spawn(game, "Garth One-Eye", A);
    naming(a, "Black Lotus");
    casting(a, true);
    activate(game, garth);
    const lotus = named(game, "Black Lotus");
    expect(lotus).toHaveLength(1);
    expect(lotus[0].zone).toBe("battlefield");
    expect(lotus[0].isToken).toBe(true);
  });

  it("a text change of black leaves the names alone (rule 612.2)", () => {
    const { game } = table();
    const changed = changeDefinitionText(game.registry.get("Garth One-Eye"), [{ from: "black", to: "white" }]);
    const ability = changed.activated[0];
    expect(ability.text).toContain("Black Lotus");
    const effect = ability.effect;
    if (effect?.kind !== "modal") throw new Error("not modal");
    expect(effect.modes.map((m) => m.text)).toContain("Black Lotus");
    const lotus = effect.modes[5].effect;
    expect(lotus.kind === "cast-now" ? lotus.copyOfCardNamed : undefined).toBe("Black Lotus");
  });

  it("once all six names have been chosen, the ability does nothing; a Garth that returns forgets", () => {
    const { game, a } = table();
    const garth = spawn(game, "Garth One-Eye", A);
    casting(a, false);
    for (const name of ["Disenchant", "Braingeyser", "Terror", "Shivan Dragon", "Regrowth", "Black Lotus"]) {
      naming(a, name);
      untap(game, garth);
      activate(game, garth);
    }
    const last = naming(a, "Disenchant");
    untap(game, garth);
    activate(game, garth);
    expect(last).toEqual([]);
    game.debugMove(garth, "exile");
    game.debugMove(garth, "battlefield");
    untap(game, garth);
    game.state.objects[garth].summoningSick = false;
    const fresh = naming(a, "Disenchant");
    activate(game, garth);
    expect(fresh[0]).toHaveLength(6);
  });
});
