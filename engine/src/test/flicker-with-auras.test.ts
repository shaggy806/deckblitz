/**
 * `flicker`'s `withAuras` — Flickerform's "exile enchanted creature and all
 * Auras attached to it. At the beginning of the next end step, return that
 * card to the battlefield under its owner's control. If you do, return the
 * other cards exiled this way to the battlefield under their owners' control
 * attached to that creature." The creature returns first; each Aura only if
 * it did, attached to it if it legally can (rule 303.4i), a bestow card
 * unattached as a creature (the rulings).
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { A, B, activate, cast, controller, counters, lands, pt, ref, settle, spawn, table, toHand, toStep, types, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

function attach(game: Game, aura: ObjectId, host: ObjectId, bestowed = false): void {
  game.state.objects[aura].attachedTo = host;
  if (bestowed) game.state.objects[aura].bestowed = true;
  invalidateComputedCache();
}

/** Flickerform cast from hand onto `host`, and {2}{W}{W} more to activate. */
function enchant(game: Game, host: ObjectId): ObjectId {
  lands(game, "Plains", 6);
  const form = toHand(game, "Flickerform");
  cast(game, form, { targets: [ref(host)] });
  expect(game.state.objects[form].attachedTo).toBe(host);
  return form;
}

describe("Flickerform", () => {
  it("exiles the creature and every Aura on it, then returns the creature and the Auras attached to it", () => {
    const { game } = table();
    // Another creature first: the Auras go back on "that creature", not one
    // chosen as they enter.
    spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[bears].counters["+1/+1"] = 1;
    const form = enchant(game, bears);
    const pacifism = spawn(game, "Pacifism", B);
    attach(game, pacifism, bears);
    activate(game, form);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, form)).toBe("exile");
    expect(zone(game, pacifism)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    // A new object (rule 400.7): no counter.
    expect(counters(game, bears)).toBe(0);
    expect(zone(game, form)).toBe("battlefield");
    expect(game.state.objects[form].attachedTo).toBe(bears);
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
    // Under their owners' control.
    expect(controller(game, pacifism)).toBe(B);
    expect(controller(game, form)).toBe(A);
  });

  it("returns an opponent's creature under its owner's control, its Auras on it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const form = enchant(game, bears);
    activate(game, form);
    toStep(game, "end");
    settle(game);
    expect(controller(game, bears)).toBe(B);
    expect(game.state.objects[form].attachedTo).toBe(bears);
    expect(controller(game, form)).toBe(A);
  });

  it("a token creature never returns, so its Auras stay in exile", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = game.battlefield.find((id) => game.state.objects[id].isToken);
    if (token === undefined) throw new Error("no token");
    const form = enchant(game, token);
    activate(game, form);
    expect(zone(game, form)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, form)).toBe("exile");
  });

  it("an Aura that can't legally enchant the returned creature stays in exile", () => {
    const { game, a } = table();
    const voice = spawn(game, "Voice of All", A);
    game.state.objects[voice].chosenOnEnter = "U";
    const form = enchant(game, voice);
    activate(game, form);
    // As it returns it chooses white: Flickerform can't enchant it now.
    a.chooseCreatureTypeFn = () => "W";
    toStep(game, "end");
    settle(game);
    expect(zone(game, voice)).toBe("battlefield");
    expect(game.state.objects[voice].chosenOnEnter).toBe("W");
    expect(zone(game, form)).toBe("exile");
  });

  it("a bestowed Aura comes back unattached, as a creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const form = enchant(game, bears);
    const satyr = spawn(game, "Boon Satyr", A);
    attach(game, satyr, bears, true);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
    activate(game, form);
    expect(zone(game, satyr)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, satyr)).toBe("battlefield");
    expect(game.state.objects[satyr].attachedTo).toBe(null);
    expect(types(game, satyr)).toContain("creature");
    expect(game.state.objects[form].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("a creature that left exile before the end step is a new object: nothing returns", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const form = enchant(game, bears);
    activate(game, form);
    game.debugMove(bears, "graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, form)).toBe("exile");
  });
});
