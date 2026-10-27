import { defineCard } from "../define.js";

// Torment. EDHREC rank 16968.
//
// Rulings: the creature is exiled only if it's still on the battlefield at
// the end step, and one that left and came back is a new object the delayed
// ability doesn't know (rule 400.7) — the delayed exile follows target 0.

const LOSE_TEXT = "At the beginning of your upkeep, you lose 1 life.";
const RETURN_TEXT =
  "At the beginning of your upkeep, you may return target creature card from your graveyard to the battlefield. That creature gains haste until end of turn. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Dawn of the Dead",
  manaCost: "{2}{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${LOSE_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: LOSE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target creature card from your graveyard to the battlefield? It's exiled at the next end step.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: 0 },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "exile", target: 0 },
              text: "Exile the creature Dawn of the Dead returned to the battlefield.",
            },
          ],
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
