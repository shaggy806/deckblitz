import { defineCard } from "../define.js";

// Rulings:
//   [2015-11-04] All experience counters are identical, no matter how you got them.

const CAST_TEXT = "Whenever you cast a creature spell with mana value 5 or greater, you get an experience counter.";
const PT_TEXT = "Kalemne gets +1/+1 for each experience counter you have.";

export default defineCard({
  name: "Kalemne, Disciple of Iroas",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["double-strike", "vigilance"],
  text: `Double strike, vigilance\n${CAST_TEXT}\n${PT_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", manaValue: { op: "gte", n: 5 } } },
      targets: [],
      effect: { kind: "add-player-counters", counter: "experience", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { playerCounters: "experience", pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
});
