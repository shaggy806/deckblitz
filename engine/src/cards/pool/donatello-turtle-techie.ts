import { defineCard } from "../define.js";

// EDHREC rank 19672.

const TEXT = "When Donatello enters, if you control an artifact, draw a card.";

export default defineCard({
  name: "Donatello, Turtle Techie",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Intervening-if (rule 603.4): checked as it triggers and as it resolves.
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
