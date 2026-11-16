/**
 * Batch 333 (author-top-cards, 2026-11-16): the freed cards the lead
 * authored — Preacher and Wish — and the duration they showed short:
 * "for as long as ~ remains tapped" and "…you control ~" on an activated
 * ability are checked continually from activation (`GameObject.untaps`,
 * `LastKnownRefs.sourceSteady`, rule 611.2b and the rulings of Preacher,
 * Rubinia Soulsinger and Entrancing Lyre).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, nextTurn, pickModes, ref, settle, spawn, table, toHand, watchTargets, zone } from "./harness.js";
import type { Game } from "../game.js";

const controllerOf = (game: Game, id: ObjectId) => game.state.objects[id].controller;
const stackSize = (game: Game) => game.state.zones.shared.stack.length;

describe("Preacher", () => {
  it("takes the creature the named opponent picks, for as long as it stays tapped", () => {
    const { game, b } = table();
    const preacher = spawn(game, "Preacher");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(b, () => [giant]);
    game.dispatch({ type: "activate-ability", player: A, source: preacher, abilityIndex: 0, targets: [], otherChooser: B });
    settle(game);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(controllerOf(game, giant)).toBe(A);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Vitalize"));
    expect(game.state.objects[preacher].tapped).toBe(false);
    expect(controllerOf(game, giant)).toBe(B);
  });

  it("does nothing if it untaps before the ability resolves, though tapped again by then", () => {
    const { game, b } = table();
    const preacher = spawn(game, "Preacher");
    const giant = spawn(game, "Hill Giant", B);
    watchTargets(b, () => [giant]);
    game.dispatch({ type: "activate-ability", player: A, source: preacher, abilityIndex: 0, targets: [], otherChooser: B });
    // Bob answers the target as it's activated.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null);
    expect(stackSize(game)).toBe(1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    // Untap it in response, then tap it again, the ability still waiting.
    cast(game, toHand(game, "Vitalize"), { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(game.state.objects[preacher].tapped).toBe(false);
    cast(game, toHand(game, "Pressure Point"), { targets: [ref(preacher)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(game.state.objects[preacher].tapped).toBe(true);
    settle(game);
    expect(stackSize(game)).toBe(0);
    expect(controllerOf(game, giant)).toBe(B);
  });
});

describe("Entrancing Lyre", () => {
  it("an untap before its ability resolves leaves the creature free to untap", () => {
    const { game, a } = table();
    const lyre = spawn(game, "Entrancing Lyre");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    game.dispatch({ type: "activate-ability", player: A, source: lyre, abilityIndex: 0, targets: [ref(bears)], xValue: 2 });
    expect(stackSize(game)).toBe(1);
    // Twitch untaps the Lyre; the Lyre's ability still taps the Bears, but
    // its "doesn't untap" never starts (its ruling).
    pickModes(a, 1);
    cast(game, toHand(game, "Twitch"), { targets: [ref(lyre)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(game.state.objects[lyre].tapped).toBe(false);
    settle(game);
    expect(game.state.objects[lyre].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Wish", () => {
  it("plays one card from the sideboard this turn, chosen as it's played", () => {
    const { game } = table({ sideboard: ["Grizzly Bears", "Llanowar Elves"] });
    lands(game, "Mountain", 3);
    lands(game, "Forest", 3);
    const outside = game.state.outside?.[A] ?? [];
    const named = (name: string) => outside.find((id) => game.state.objects[id].cardName === name)!;
    const bears = named("Grizzly Bears");
    const elves = named("Llanowar Elves");
    const castFrom = (card: ObjectId) => game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === card);
    expect(castFrom(bears)).toBeUndefined();
    cast(game, toHand(game, "Wish"));
    expect(castFrom(bears)).toBeDefined();
    expect(castFrom(elves)).toBeDefined();
    const offer = castFrom(bears);
    if (offer?.kind !== "cast-spell") throw new Error("no offer");
    cast(game, bears, offer.via !== undefined ? { via: offer.via } : {});
    expect(zone(game, bears)).toBe("battlefield");
    expect(castFrom(elves)).toBeUndefined(); // one card
  });

  it("does nothing past this turn", () => {
    const { game } = table({ sideboard: ["Grizzly Bears"] });
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2);
    const bears = (game.state.outside?.[A] ?? [])[0];
    cast(game, toHand(game, "Wish"));
    nextTurn(game);
    nextTurn(game);
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bears)).toBe(false);
  });
});
