/**
 * Abilities on the stack that are copies of one another as far as a player
 * can tell: the same ability of a card of the same name, controlled by the
 * same player, choosing no targets, no X and no modes — Mesmeric Orb's
 * trigger for each permanent that untaps, Scute Swarm's landfall from each
 * Swarm. Each is still its own object that resolves on its own, with
 * priority between (rule 405.5); this only says they look the same. The
 * client draws a run of them as one stack entry ("×60"), and the room
 * resolves a run asked to "resolve all" in one frame rather than one each.
 *
 * Reads only fields both a `GameObject` and a client's `VisibleObject` have.
 */

import type { PlayerId } from "./primitives.js";

export interface StackCopyFields {
  readonly kind: "card" | "ability" | "emblem";
  readonly cardName: string;
  readonly abilityIndex: number | null;
  readonly controller: PlayerId;
  readonly targets: readonly unknown[] | null;
  readonly xValue: number | null;
  readonly chosenModes?: readonly number[];
}

/** What a run of copies shares, or `null` for anything that isn't a plain
 * untargeted ability. */
export function stackCopyKey(o: StackCopyFields): string | null {
  if (o.kind !== "ability" || o.abilityIndex === null) return null;
  if (o.targets !== null && o.targets.some((t) => t !== undefined && t !== null)) return null;
  if (o.xValue !== null && o.xValue !== 0) return null;
  if (o.chosenModes !== undefined && o.chosenModes.length > 0) return null;
  return `${o.controller}|${o.cardName}|${o.abilityIndex}`;
}
