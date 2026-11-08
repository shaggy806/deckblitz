import { defineCard } from "../define.js";

const FLYING_TEXT = "As long as you've put one or more +1/+1 counters on Beast this turn, he has flying.";
const DRAW_TEXT = "Whenever Beast deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Beast, Erudite Aerialist",
  manaCost: "{3}{G/U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Scientist", "Hero"],
  power: 3,
  toughness: 3,
  text: `${FLYING_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      // The journal's counters you put on Beast, in the stint he's in now.
      affects: { scope: "self" },
      condition: { kind: "source", filter: { journaled: { what: "counters-put", by: "you", counter: "+1/+1" } } },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
