import { defineCard } from "../define.js";

// EDHREC rank 11783. Marvel Super Heroes Commander.
//
// Not a mana ability (rule 605.1b: it triggers on casting a spell, not on a
// mana ability), so it uses the stack and the {R} is added as it resolves.
const CAST_TEXT =
  "Whenever you cast a spell, add {R} and put a +1/+1 counter on The Vision and Scarlet Witch.";

export default defineCard({
  name: "The Vision and Scarlet Witch",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Mutant", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "R", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
