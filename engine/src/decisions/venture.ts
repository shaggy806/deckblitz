/**
 * A venture's choice (rule 701.49) — which dungeon to enter (701.49a, c), or,
 * at a fork, which room to move into (701.49b). One kind for both: either is
 * one pick from a short list, and the offer carries the dungeon maps a
 * driver draws the choice on (`DungeonMap`), so the client picks a room on
 * the map rather than from a row of names.
 */

import type { Action, LegalAction } from "../actions.js";
import { dungeonMap } from "../cards/dungeons.js";
import { defineDecision } from "./define.js";

/** What a `venture` decision offers — the offer's fields a chooser reads. */
export type VentureOffer = Pick<Extract<LegalAction, { kind: "venture" }>, "dungeons" | "from" | "rooms" | "maps">;
/** A `venture` decision's answer: a dungeon, or a room by index. */
export type VentureAnswer = { readonly dungeon: string } | { readonly room: number };

/** The first offered dungeon, else the first offered room. */
export function defaultVenture(offer: VentureOffer): VentureAnswer {
  if (offer.dungeons !== undefined && offer.dungeons.length > 0) return { dungeon: offer.dungeons[0]! };
  return { room: offer.rooms?.[0] ?? 0 };
}

export const venture = defineDecision({
  kind: "venture",

  hasSource: true,

  legal: (_ctx, awaiting): LegalAction[] => {
    const names = awaiting.dungeons ?? (awaiting.dungeon !== undefined ? [awaiting.dungeon] : []);
    return [
      {
        kind: "venture",
        source: awaiting.source,
        ...(awaiting.dungeons !== undefined ? { dungeons: [...awaiting.dungeons] } : {}),
        ...(awaiting.from !== undefined ? { from: awaiting.from } : {}),
        ...(awaiting.rooms !== undefined ? { rooms: [...awaiting.rooms] } : {}),
        maps: names.flatMap((name) => {
          const map = dungeonMap(name);
          return map === undefined ? [] : [map];
        }),
      },
    ];
  },

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "venture") return `${player} is not being asked to venture`;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "venture" || awaiting.player !== player) {
      return `${player} is not being asked to venture`;
    }
    if (awaiting.dungeons !== undefined) {
      return action.dungeon !== undefined && awaiting.dungeons.includes(action.dungeon)
        ? null
        : `${String(action.dungeon)} is not a dungeon ${player} may enter`;
    }
    return action.room !== undefined && (awaiting.rooms ?? []).includes(action.room)
      ? null
      : `${String(action.room)} is not a room ${player} may move into`;
  },

  apply: (host, action): void => {
    if (action.type !== "venture") return;
    host.applyVenture(action.player, {
      ...(action.dungeon !== undefined ? { dungeon: action.dungeon } : {}),
      ...(action.room !== undefined ? { room: action.room } : {}),
    });
  },

  ask: (controller, view, awaiting, player): Action => {
    const offer = view
      .legalActions()
      .find((a): a is Extract<LegalAction, { kind: "venture" }> => a.kind === "venture");
    const answer = controller.chooseVenture(
      view,
      offer ?? {
        ...(awaiting.dungeons !== undefined ? { dungeons: awaiting.dungeons } : {}),
        ...(awaiting.rooms !== undefined ? { rooms: awaiting.rooms } : {}),
        maps: [],
      },
    );
    return { type: "venture", player, ...answer };
  },

  // Any one of the offered dungeons or rooms.
  randomAnswer: (legal, player, rng): Action => {
    if (legal.dungeons !== undefined && legal.dungeons.length > 0) {
      return { type: "venture", player, dungeon: legal.dungeons[Math.floor(rng.random() * legal.dungeons.length)]! };
    }
    const rooms = legal.rooms ?? [];
    if (rooms.length === 0) return { type: "venture", player, ...defaultVenture(legal) };
    return { type: "venture", player, room: rooms[Math.floor(rng.random() * rooms.length)]! };
  },
});
