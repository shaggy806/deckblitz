import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, create a 2/2 white Cat creature token for each Equipment attached to Kemba.";

// Counted as the trigger resolves: whoever controls the Equipment, it's
// attached to Kemba.
export default defineCard({
  name: "Kemba, Kha Regent",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 4,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Cat Token",
        count: { countOf: { subtype: "Equipment", attachedTo: { isSource: true } } },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
