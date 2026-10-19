import { defineCard } from "../define.js";

export default defineCard({
  name: "Shadow Prophecy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Domain — Look at the top X cards of your library, where X is the number of basic land types among lands you control. Put up to two of them into your hand and the rest into your graveyard. You lose 2 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: { basicLandTypes: "you" },
        min: 0,
        max: 2,
        destination: "hand",
        leftover: "graveyard",
      },
      { kind: "lose-life", amount: 2 },
    ],
  },
});
