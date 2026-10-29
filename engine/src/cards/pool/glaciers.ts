import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {W}{U}.";

// "All Mountains are Plains" sets their land type (rule 305.7: they lose
// their rules text and tap for {W}); it depends on anything that makes a land
// a Mountain, so it applies after it whatever the timestamps (613.8a).
export default defineCard({
  name: "Glaciers",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\nAll Mountains are Plains.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{W}{U}", text: "Pay {W}{U}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", subtype: "Mountain" } },
      setSubtypes: ["Plains"],
      text: "All Mountains are Plains.",
    },
  ],
});
