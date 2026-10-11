import { defineCard } from "../define.js";

// "All Merfolk you control": every Merfolk permanent — this kindred Merfolk
// enchantment included (untapping it does nothing).

const TEXT = "At the beginning of your end step, untap all Merfolk you control.";

export default defineCard({
  name: "Merrow Commerce",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["kindred", "enchantment"],
  subtypes: ["Merfolk"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "untap-all", filter: { subtype: "Merfolk", controlledBy: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
