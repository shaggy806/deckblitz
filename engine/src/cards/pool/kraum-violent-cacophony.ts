import { defineCard } from "../define.js";

// EDHREC rank 9263.
//
// Sunstar Lightsmith's trigger: spells cast before Kraum entered count (the
// ruling).
const CAST_TEXT = "Whenever you cast your second spell each turn, put a +1/+1 counter on Kraum and draw a card.";

export default defineCard({
  name: "Kraum, Violent Cacophony",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
