import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 27867. "Blue creatures" is every blue creature
// on the battlefield, whoever controls it.

const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {U}{U}.";
const ANTHEM = "Blue creatures get +1/+1.";

export default defineCard({
  name: "Sunken City",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${ANTHEM}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{U}{U}", text: "Pay {U}{U}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["U"] } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
});
