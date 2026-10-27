import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 27550.
//
// A "prevent all" shield on the Pronghorn for the turn (`prevent-damage`
// with `amount: "all"`), never used up; it's a new object without it if it
// changes zones (rule 400.7).

const TEXT = "Discard a card: Prevent all damage that would be dealt to this creature this turn.";

export default defineCard({
  name: "Trained Pronghorn",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Antelope"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: "all" },
      resolve: null,
      text: TEXT,
    },
  ],
});
