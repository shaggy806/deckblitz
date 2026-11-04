import { defineCard } from "../define.js";
import { landUntilCastFromExile } from "../helpers.js";

const ENTERS_TEXT = "When this creature enters, you gain 3 life.";
const EXILE = landUntilCastFromExile(["W", "U", "B"]);

export default defineCard({
  name: "Shattered Seraph",
  manaCost: "{4}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["creature"],
  subtypes: ["Angel", "Rogue"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${EXILE.text}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [EXILE],
});
