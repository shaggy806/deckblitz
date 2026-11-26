import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  B,
  activate,
  cast,
  destroy,
  enter,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

/**
 * A rules audit's seventh slice (2026-11-26): copying (rule 707) — what a
 * Clone takes from a permanent that is itself unusual: face down, a token
 * copy with an exception, transformed, merged, with linked abilities or an
 * "as it enters" choice.
 */

const named = (game: Game, name: string, player?: PlayerId): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => printedCardName(game.state.objects[id]) === name && (player === undefined || game.state.objects[id].controller === player),
  );

/** Alice casts Clone, copying `original`. */
function cloneOf(game: Game, a: ReturnType<typeof table>["a"], original: ObjectId): ObjectId {
  a.chooseCopyFn = (_view, _source, options) => (options.includes(original) ? original : null);
  lands(game, "Island", 4);
  const clone = toHand(game, "Clone");
  cast(game, clone);
  settle(game);
  return clone;
}

describe("copying, audited", () => {
  it("a copy takes the copiable values only: not counters or a pump (rules 707.2, 707.2b)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(giant)]);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" }, [ref(giant)]);
    const clone = cloneOf(game, a, giant);
    expect(printedCardName(game.state.objects[clone])).toBe("Hill Giant");
    expect(pt(game, clone)).toEqual({ power: 3, toughness: 3 });
  });

  it("a copy of a face-down creature is a nameless 2/2 with no abilities, face up (rules 707.2, 708.2)", () => {
    const { game, a } = table();
    game.debugApplyEffect(B, { kind: "manifest", who: "you" });
    settle(game);
    const facedown = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].faceDown !== undefined)!;
    expect(facedown).toBeDefined();
    const clone = cloneOf(game, a, facedown);
    expect(zone(game, clone)).toBe("battlefield");
    expect(pt(game, clone)).toEqual({ power: 2, toughness: 2 });
    expect(game.state.objects[clone].faceDown).toBeUndefined();
    expect(keywords(game, clone).size).toBe(0);
  });

  it("a copy of a Kiki-Jiki token copies its 'except it has haste' (rule 707.9b)", () => {
    const { game, a } = table();
    const kiki = spawn(game, "Kiki-Jiki, Mirror Breaker");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, kiki, 0, { targets: [ref(bears)] });
    const token = named(game, "Grizzly Bears").find((id) => id !== bears)!;
    expect(keywords(game, token).has("haste")).toBe(true);
    const clone = cloneOf(game, a, token);
    expect(printedCardName(game.state.objects[clone])).toBe("Grizzly Bears");
    expect(keywords(game, clone).has("haste")).toBe(true);
    // Not the token's delayed sacrifice: that was the ability's, not a copiable value.
    expect(game.state.objects[clone].isToken).toBe(false);
  });

  it("a copy of a transformed permanent is its back face (rule 707.8)", () => {
    const { game, a } = table();
    const delver = spawn(game, "Delver of Secrets", B);
    game.debugApplyEffect(B, { kind: "transform", target: 0 }, [ref(delver)]);
    settle(game);
    expect(printedCardName(game.state.objects[delver])).toBe("Insectile Aberration");
    const clone = cloneOf(game, a, delver);
    expect(printedCardName(game.state.objects[clone])).toBe("Insectile Aberration");
    expect(pt(game, clone)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, clone).has("flying")).toBe(true);
  });

  it("a copy of a mutated creature is the whole merged creature: the top card with every card's abilities (rules 707.2, 730.2a)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Glowstone Recluse"), { overload: true, targets: [ref(bears)] });
    expect(printedCardName(game.state.objects[bears])).toBe("Glowstone Recluse");
    pickModes(a, 0);
    const clone = cloneOf(game, a, bears);
    expect(printedCardName(game.state.objects[clone])).toBe("Glowstone Recluse");
    expect(keywords(game, clone).has("reach")).toBe(true);
    // A single card, not merged: it comes apart into nothing.
    expect(game.state.objects[clone].merged).toBeUndefined();
  });

  it("a Clone of Banisher Priest: each one's exile is its own (rule 707.7)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    const priest = enter(game, "Banisher Priest");
    expect(zone(game, bears)).toBe("exile");
    pickTargets(a, giant);
    const clone = cloneOf(game, a, priest);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, priest);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("exile");
    destroy(game, clone);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("a copy makes its own 'as it enters' choice (rule 707.6): Voice of All", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "R";
    lands(game, "Plains", 4);
    const voice = toHand(game, "Voice of All");
    cast(game, voice);
    expect(game.state.objects[voice].chosenOnEnter).toBe("R");
    a.chooseCreatureTypeFn = () => "U";
    const clone = cloneOf(game, a, voice);
    expect(printedCardName(game.state.objects[clone])).toBe("Voice of All");
    expect(game.state.objects[clone].chosenOnEnter).toBe("U");
    expect(game.state.objects[voice].chosenOnEnter).toBe("R");
  });
});
