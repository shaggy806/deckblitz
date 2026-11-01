import { defineCard } from "../define.js";

// A `oneEach` look: a slot per creature type, a card of two of them filling
// either one, and only what's taken revealed.
const ATTACKS =
  "Whenever this creature attacks, look at the top four cards of your library. You may reveal a Cleric card, a " +
  "Rogue card, a Warrior card, and/or a Wizard card from among them and put those cards into your hand. Put the " +
  "rest on the bottom of your library in a random order.";

const TYPES = ["Cleric", "Rogue", "Warrior", "Wizard"] as const;

export default defineCard({
  name: "Harper Recruiter",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: TYPES.length,
        together: {
          oneEach: TYPES.map((subtype) => ({ label: `a ${subtype} card`, filter: { subtype } })),
          text: "a Cleric card, a Rogue card, a Warrior card, and/or a Wizard card",
        },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
