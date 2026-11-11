import { defineCard } from "../define.js";

// EDHREC rank 5885.
//
// Rulings:
//   [2014-02-01] Ephara's last ability checks at the beginning of each upkeep whether another
//     creature entered the battlefield under your control last turn. The ability will trigger only
//     once no matter how many creatures entered the battlefield under your control that turn.
//   [2014-02-01] If a noncreature permanent you control becomes a creature, it will not cause
//     Ephara's last ability to trigger the following turn.
//   [2014-02-01] The last ability will trigger regardless of what has happened to the creature
//     that entered the battlefield on the previous turn.
const DEVOTION_TEXT = "As long as your devotion to white and blue is less than seven, Ephara isn't a creature.";
const DRAW_TEXT =
  "At the beginning of each upkeep, if you had another creature enter the battlefield under your control last turn, draw a card.";

export default defineCard({
  name: "Ephara, God of the Polis",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 5,
  keywords: ["indestructible"],
  text: `Indestructible\n${DEVOTION_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["W", "U"], atMost: 6 },
      removeTypes: ["creature"],
      text: DEVOTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: {
        kind: "turn-history",
        what: "entered",
        window: "last-turn",
        filter: { type: "creature" },
        excludeSelf: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
