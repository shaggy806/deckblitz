import { defineCard } from "../define.js";

const COMPANION_TEXT = "Companion — Your starting deck contains only cards with mana value 3 or greater and land cards.";
const ENTER_TEXT = "When Keruga enters, draw a card for each other permanent you control with mana value 3 or greater.";

export default defineCard({
  name: "Keruga, the Macrosage",
  manaCost: "{3}{G/U}{G/U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Hippo"],
  power: 5,
  toughness: 4,
  text: `${COMPANION_TEXT}\n${ENTER_TEXT}`,
  companion: { kind: "each-card", of: "nonland", test: { manaValueAtLeast: 3 } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: { countOf: { controlledBy: "you", manaValue: { op: "gte", n: 3 } }, excludeSelf: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
