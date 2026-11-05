import { defineCard } from "../define.js";

// EDHREC rank 21219. Renet entered this turn too, and isn't returned.
const ETB_TEXT = "When Renet enters, return each other nonland permanent that entered this turn to its owner's hand.";

export default defineCard({
  name: "Renet, Temporal Apprentice",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { notTypes: ["land"], enteredThisTurn: true },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
