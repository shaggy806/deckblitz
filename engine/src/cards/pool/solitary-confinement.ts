import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless you discard a card.";

export default defineCard({
  name: "Solitary Confinement",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\nSkip your draw step.\nYou have shroud. (You can't be the target of spells or abilities.)\nPrevent all damage that would be dealt to you.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ discard: 1, text: "Discard a card" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    { affects: { scope: "self" }, skipsSteps: { who: "you", steps: ["draw"] }, text: "Skip your draw step." },
    { affects: { scope: "self" }, playerKeywords: ["shroud"], text: "You have shroud." },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", instead: { prevent: true }, to: "you" },
      text: "Prevent all damage that would be dealt to you.",
    },
  ],
});
