import { defineCard } from "../define.js";

// EDHREC rank 28772.

export default defineCard({
  name: "Collation Trimatrix",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 1,
  toughness: 1,
  text: "Tap three untapped artifact creatures you control: You draw a card and lose 1 life.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: {
          count: 3,
          filter: { types: ["artifact", "creature"], controlledBy: "you" },
          includeSelf: true,
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "Tap three untapped artifact creatures you control: You draw a card and lose 1 life.",
    },
  ],
});
