import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 13350. A mana ability (rule 605.1a): the
// discard moves no card to or from a library.

const TEXT = "Discard a card, Sacrifice this creature: Add {B}{B}{B}.";

export default defineCard({
  name: "Overeager Apprentice",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 }, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
