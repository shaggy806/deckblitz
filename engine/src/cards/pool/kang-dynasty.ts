import { defineCard } from "../define.js";
import type { SagaChapter } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 14416. One optional target per opponent, by seat; the delayed
// trigger watches the targets still legal as the chapter resolves, and the
// Saga's controller draws.
const I_II_TEXT =
  "For each opponent, tap up to one target creature that player controls. Goad those creatures. Until your next turn, whenever any of those creatures deals combat damage to a player, draw a card.";
const III_TEXT =
  "Target creature you control gets +1/+1 until end of turn for each card in your hand and can't be blocked this turn.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

const goadChapter = (at: number): SagaChapter => ({
  at: [at],
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "tap", target: 2 },
      { kind: "goad", target: 0 },
      { kind: "goad", target: 1 },
      { kind: "goad", target: 2 },
      {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "deals-damage", who: "self", combat: true, to: "player" },
          watching: "targets",
          until: "until-your-next-turn",
        },
        effect: { kind: "draw", amount: 1 },
        text: "Until your next turn, whenever any of those creatures deals combat damage to a player, draw a card.",
      },
    ],
  },
  resolve: null,
  text: `${at === 1 ? "I" : "II"} — ${I_II_TEXT}`,
});

export default defineCard({
  name: "Kang Dynasty",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI, II — ${I_II_TEXT}\nIII — ${III_TEXT}`,
  chapters: [
    goadChapter(1),
    goadChapter(2),
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: 0,
            power: { cardsInHand: "you" },
            toughness: { cardsInHand: "you" },
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: `III — ${III_TEXT}`,
    },
  ],
});
