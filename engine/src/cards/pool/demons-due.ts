import { defineCard } from "../define.js";

// EDHREC rank 15639. Streets of New Capenna. Read the Bones at instant speed.
export default defineCard({
  name: "Demon's Due",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Scry 2, then draw two cards. You lose 2 life.",
  effect: {
    kind: "scry",
    amount: 2,
    then: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 2 },
        { kind: "lose-life", amount: 2 },
      ],
    },
  },
});
