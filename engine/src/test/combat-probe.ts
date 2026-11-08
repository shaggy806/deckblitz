/**
 * What older tests asked of the removed combat state, read off the one combat
 * rule record (`combat/rules.ts`): tests that care about where a requirement is
 * kept ask here, rather than each knowing `PtModifier.restrictions`.
 */

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { PlayerEffect } from "../state.js";

/** Every `must-block` on a modifier, by blocker, and the attacker it names. */
export function blockRecords(game: Game): { blocker: ObjectId; attacker?: ObjectId }[] {
  const out: { blocker: ObjectId; attacker?: ObjectId }[] = [];
  for (const object of Object.values(game.state.objects)) {
    if (object.zone !== "battlefield") continue;
    for (const m of object.modifiers) {
      for (const r of m.restrictions ?? []) {
        if (r === "must-block") out.push({ blocker: object.id });
        else if (typeof r !== "string" && r.kind === "must-block") {
          const a = r.attacker;
          out.push({ blocker: object.id, ...(typeof a === "object" && "stint" in a ? { attacker: a.object } : {}) });
        }
      }
    }
  }
  return out;
}

/** The player a must-attack on this creature's modifiers is aimed at. */
export function aimedAt(game: Game, id: ObjectId): PlayerId | undefined {
  for (const m of game.state.objects[id].modifiers) {
    for (const r of m.restrictions ?? []) {
      if (typeof r !== "string" && r.kind === "must-attack" && typeof r.at === "object" && "player" in r.at) return r.at.player;
    }
  }
  return undefined;
}

/** Aims this creature at a player for the turn, as encore does. */
export function aimAt(game: Game, id: ObjectId, player: PlayerId, you: PlayerId): void {
  game.state.objects[id].modifiers.push({
    power: 0,
    toughness: 0,
    keywords: [],
    untilEndOfTurn: false,
    restrictions: [{ kind: "must-attack", at: { player }, you }],
  });
}

/** Every combat rule over the game in force. */
export function overGame(game: Game): NonNullable<PlayerEffect["combat"]>[] {
  return (game.state.playerEffects ?? []).flatMap((e) => (e.combat !== undefined ? [e.combat] : []));
}

/** Whether a modifier on this creature holds a combat rule of this kind. */
export function hasRecord(game: Game, id: ObjectId, kind: string): boolean {
  return game.state.objects[id].modifiers.some((m) => (m.restrictions ?? []).some((r) => (typeof r === "string" ? r : r.kind) === kind));
}
