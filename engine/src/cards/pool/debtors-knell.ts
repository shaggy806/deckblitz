import { defineCard } from "../define.js";

// EDHREC rank 7975.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, put target creature card from a graveyard onto the battlefield under your control.";

export default defineCard({
  name: "Debtors' Knell",
  manaCost: "{4}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `({W/B} can be paid with either {W} or {B}.)\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
