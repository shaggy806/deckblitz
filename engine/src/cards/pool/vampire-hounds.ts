import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 29985.

const TEXT = "Discard a creature card: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Vampire Hounds",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
