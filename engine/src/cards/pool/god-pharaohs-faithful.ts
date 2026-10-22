import { defineCard } from "../define.js";

// EDHREC rank 20945. Questing Druid's colour-filtered cast trigger: a spell of
// two of these colours still triggers it once.

const CAST = "Whenever you cast a blue, black, or red spell, you gain 1 life.";

export default defineCard({
  name: "God-Pharaoh's Faithful",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 4,
  text: CAST,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }] },
      },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: CAST,
    },
  ],
});
