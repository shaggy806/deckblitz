import { defineCard } from "../define.js";

// EDHREC rank 16977.
//
// A requirement on each opponent's declaration (rule 508.1d): one creature
// in all, attacking you or a planeswalker you control, not one for you and
// one for each planeswalker; the rest attack whom they like or stay home
// (the ruling). One that can't attack you, or would have to pay to, isn't
// made to; with none able, it asks nothing.
const TEMPT_TEXT =
  "Each opponent must attack you or a planeswalker you control with at least one creature each combat if able.";
const TREASURE_TEXT =
  "At the beginning of your end step, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";

export default defineCard({
  name: "Trove of Temptation",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TEMPT_TEXT}\n${TREASURE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      restrictions: [{ kind: "must-attack", at: "you-and-planeswalkers", atLeastOne: true }],
      text: TEMPT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
