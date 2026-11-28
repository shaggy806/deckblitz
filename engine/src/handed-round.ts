/**
 * Permanents that don't stay where they are: one a trigger of its own hands
 * to each player in turn, and one held only until end of turn. Read by the
 * bots' swing back (`bot/combat-math.ts`) and their aim (`target-polarity.ts`).
 * Reads only; nothing here is a rule.
 */
import type { CardRegistry } from "./cards.js";
import type { PlayerId } from "./primitives.js";
import { rulesTextName } from "./state.js";
import type { GameObject } from "./state.js";

/** Per registry, whether a card hands itself to the player whose upkeep
 * begins ({@link handedRound}). */
const handedRoundByName = new WeakMap<CardRegistry, Map<string, boolean>>();

/**
 * Whether the card `name` is **handed round the table**: a trigger of its own
 * at the beginning of each opponent's upkeep, or each player's, gives that
 * player control of it (Slicer, Hired Muscle; Alexios, Deimos of Kosmos;
 * Karona, False God). Such a creature attacks on every player's turn, not
 * only its controller's.
 */
export function handedRound(registry: CardRegistry, name: string): boolean {
  let known = handedRoundByName.get(registry);
  if (known === undefined) {
    known = new Map();
    handedRoundByName.set(registry, known);
  }
  const cached = known.get(name);
  if (cached !== undefined) return cached;
  const handsItself = (node: unknown): boolean => {
    if (node === null || typeof node !== "object") return false;
    if (Array.isArray(node)) return node.some(handsItself);
    const record = node as { readonly kind?: unknown; readonly target?: unknown; readonly who?: unknown };
    if (record.kind === "gain-control" && record.target === "source" && record.who === "active-player") return true;
    return Object.values(node).some(handsItself);
  };
  const answer =
    registry.has(name) &&
    registry.get(name).triggered.some((t) => {
      const trigger = t.trigger as { readonly on?: unknown; readonly step?: unknown; readonly who?: unknown };
      return (
        trigger.on === "step-begins" &&
        trigger.step === "upkeep" &&
        (trigger.who === "opponent" || trigger.who === "any") &&
        handsItself(t.effect)
      );
    });
  known.set(name, answer);
  return answer;
}

/**
 * Whether `object`, on the battlefield under `me`'s control, is another
 * player's that `me` only has for now: held until end of turn (Act of
 * Treason, a Slicer handed over for the turn), or handed round and due to
 * move on at the next upkeep (Alexios). It is `me`'s to attack with and the
 * owner's to get back, so removal of `me`'s is rightly aimed at it.
 */
export function onLoan(registry: CardRegistry, object: GameObject, me: PlayerId): boolean {
  if (object.zone !== "battlefield" || object.controller !== me || object.owner === me) return false;
  return object.controlEndsAtCleanup || handedRound(registry, rulesTextName(object));
}

/**
 * {@link onLoan} from the owner's seat: whether `object`, on the battlefield
 * under another player's control, is `me`'s and comes back — held by them
 * until end of turn (a Slicer handed over for the turn), or handed round
 * (Alexios). Whoever holds it, saving it saves `me`'s permanent, so help of
 * `me`'s is rightly aimed at it.
 */
export function lentOut(registry: CardRegistry, object: GameObject, me: PlayerId): boolean {
  if (object.zone !== "battlefield" || object.owner !== me || object.controller === me) return false;
  return object.controlEndsAtCleanup || handedRound(registry, rulesTextName(object));
}
