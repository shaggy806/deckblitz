import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 25765.
//
// Rulings:
//   [2005-06-01] Once the at-end-of-turn ability triggers, it affects the player who controlled
//     Measure of Wickedness at that time. If Measure of Wickedness is under a different player's
//     control as its at-end-of-turn ability resolves, however, Measure of Wickedness stays on the
//     battlefield.
//
// The end-step ability's controller is the one who loses the life; `sacrifice-source` only
// sacrifices it while they still control it (rule 701.21a — the ruling). A card put into the
// graveyard along with this one isn't seen by it ("another"), and tokens aren't cards.

const END_TEXT = "At the beginning of your end step, sacrifice this enchantment and you lose 8 life.";
const GRAVEYARD_TEXT =
  "Whenever another card is put into your graveyard from anywhere, target opponent gains control of this enchantment.";

export default defineCard({
  name: "Measure of Wickedness",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${END_TEXT}\n${GRAVEYARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice-source" }, { kind: "lose-life", amount: 8 }],
      },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you" },
      targets: ["opponent"],
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: GRAVEYARD_TEXT,
    },
  ],
});
