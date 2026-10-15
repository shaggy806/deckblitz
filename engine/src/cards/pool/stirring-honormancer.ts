import { defineCard } from "../define.js";

// EDHREC rank 26604. Secrets of Strixhaven.
//
// X is counted once, as the ability resolves (the ruling) — this creature
// included while it's still on the battlefield.
const ENTERS_TEXT =
  "When this creature enters, look at the top X cards of your library, where X is the number of creatures you control. Put one of those cards into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Stirring Honormancer",
  manaCost: "{2}{W}{W/B}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Rhino", "Bard"],
  power: 4,
  toughness: 5,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { countOf: { type: "creature", controlledBy: "you" } },
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
