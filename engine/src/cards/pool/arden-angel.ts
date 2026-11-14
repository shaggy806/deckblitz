import { defineCard } from "../define.js";

// Works only while it's in your graveyard; the intervening "if" is asked as
// the upkeep begins and again as it resolves (rule 603.4).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if Arden Angel is in your graveyard, roll a four-sided die. If the result is 1, return Arden Angel from your graveyard to the battlefield.";

export default defineCard({
  name: "Arden Angel",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 4,
        then: {
          kind: "conditional",
          condition: { kind: "amounts", left: { roll: "total" }, op: "eq", right: 1 },
          then: { kind: "put-onto-battlefield", target: "source" },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
