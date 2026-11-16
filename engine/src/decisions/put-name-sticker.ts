/**
 * Putting a name sticker on an object (rules 123.3, 123.6b) — the
 * `put-sticker` effect, _____ Goblin's "you may put a name sticker on it".
 * The player putting it chooses which of their name stickers (one not on
 * anything they own, 123.3), or none when the card says "may"; the object's
 * controller chooses where in its name the words go — at the beginning or
 * after any number of its words (123.6b). One answer carries both when one
 * player makes both choices, which is nearly always; when someone else
 * controls the object, they're asked for the place afterwards (`stage:
 * "place"`).
 *
 * The raise is `Game.putNameSticker`, reached from the effect; the answer is
 * `Game.applyPutNameSticker`. See docs/plans/stickers.md.
 */

import type { Action, LegalAction } from "../actions.js";
import { nameIfAny } from "../state.js";
import type { AwaitingDecision, GameState } from "../state.js";
import { blankSlot, nameWithSticker, nameWordCount } from "../stickers.js";
import { defineDecision } from "./define.js";

type Offer = Extract<LegalAction, { kind: "put-name-sticker" }>;
type Asked = Extract<AwaitingDecision, { kind: "put-name-sticker" }>;

/** How many places the one answering chooses among: one when someone else
 * places it, else the object's words and one (rule 123.6b). */
export function stickerPlaces(state: Readonly<GameState>, awaiting: Asked): number {
  if (awaiting.stage === "choose" && awaiting.placer !== awaiting.putter) return 1;
  const object = state.objects[awaiting.object];
  return object === undefined ? 1 : nameWordCount(nameIfAny(object)) + 1;
}

export const putNameSticker = defineDecision({
  kind: "put-name-sticker",

  hasSource: true,

  legal: (ctx, awaiting): LegalAction[] => {
    const object = ctx.state.objects[awaiting.object];
    const name = object === undefined ? null : nameIfAny(object);
    const places = stickerPlaces(ctx.state, awaiting);
    const fill = blankSlot(name);
    return [
      {
        kind: "put-name-sticker",
        source: awaiting.source,
        object: awaiting.object,
        stage: awaiting.stage,
        stickers: [...awaiting.options],
        names: awaiting.options.map((o) =>
          places === 1
            ? [nameWithSticker(name, o.text, fill)]
            : Array.from({ length: places }, (_, p) => nameWithSticker(name, o.text, p)),
        ),
        optional: awaiting.stage === "choose" && awaiting.optional,
        fill: places === 1 ? 0 : fill,
        ...(awaiting.count !== undefined ? { count: awaiting.count } : {}),
      },
    ];
  },

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked to put a name sticker`;
    if (action.type !== "put-name-sticker") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "put-name-sticker" || awaiting.player !== player) return asked;
    if (action.sticker === null) {
      return awaiting.stage === "choose" && awaiting.optional ? null : "A name sticker must be put";
    }
    const chosen = action.sticker;
    if (!awaiting.options.some((o) => o.sheet === chosen.sheet && o.index === chosen.index)) {
      return `${player} can't put that name sticker`;
    }
    const places = stickerPlaces(ctx.state, awaiting);
    if (!Number.isInteger(action.position) || action.position < 0 || action.position >= places) {
      return `A name sticker goes after 0 to ${places - 1} of its words`;
    }
    return null;
  },

  apply: (host, action): void => {
    if (action.type !== "put-name-sticker") return;
    host.applyPutNameSticker(action.player, action.sticker, action.position);
  },

  ask: (controller, view, _awaiting, player): Action => {
    const offer = view.legalActions().find((a): a is Offer => a.kind === "put-name-sticker");
    if (offer === undefined) throw new Error(`${player} has no put-name-sticker offer`);
    const answer = controller.putNameSticker(view, offer);
    return { type: "put-name-sticker", player, sticker: answer.sticker, position: answer.position };
  },

  /** Which sticker is the question, each in the place the name waits for
   * one: those with the most of what the card counts first, then none. */
  candidates: (legal, player, limit): Action[] => {
    if (legal.kind !== "put-name-sticker") return [];
    const ranked = legal.stickers
      .map((s, i) => ({ s, i }))
      .sort((a, b) => (legal.count === undefined ? 0 : b.s.uniqueVowels - a.s.uniqueVowels) || a.i - b.i);
    const position = legal.names[0]?.length === 1 ? 0 : legal.fill;
    const answers: Action[] = ranked
      .slice(0, Math.max(2, limit))
      .map(({ s }) => ({ type: "put-name-sticker", player, sticker: { sheet: s.sheet, index: s.index }, position }));
    if (legal.optional) answers.push({ type: "put-name-sticker", player, sticker: null, position: 0 });
    return answers;
  },

  randomAnswer: (legal, player, rng): Action => {
    const pick = rng.pickIndex(legal.stickers.length + (legal.optional ? 1 : 0));
    if (pick >= legal.stickers.length) return { type: "put-name-sticker", player, sticker: null, position: 0 };
    const s = legal.stickers[pick];
    return {
      type: "put-name-sticker",
      player,
      sticker: { sheet: s.sheet, index: s.index },
      position: rng.pickIndex(legal.names[pick].length),
    };
  },
});
