import { defineCard } from "../define.js";

// Braided Net's back face. Each artifact you control is counted as the ability resolves, this one
// among them; "third from the top" with two or fewer cards left is the bottom (the ruling).

const TEXT =
  "{3}{U}, {T}: Draw a card for each artifact you control, then put this artifact into its owner's library third from the top.";

export default defineCard({
  name: "Braided Quipu",
  art: "https://cards.scryfall.io/art_crop/back/6/8/68a6ede0-6d57-4e29-9e3b-3569ab7f0bcd.jpg",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { countOf: { type: "artifact", controlledBy: "you" } } },
          { kind: "put-on-library", target: "source", position: { fromTop: 3 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Braided Net", "Braided Quipu"],
  transform: true,
});
