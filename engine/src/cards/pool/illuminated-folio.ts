import { defineCard } from "../define.js";

// EDHREC rank 26246. The two cards are chosen as the cost is paid, from the
// ones that share a colour with another (colourless shares none: the
// ruling), and stay in the hand; the ability resolves whatever becomes of
// them (the ruling).

const TEXT = "{1}, {T}, Reveal two cards from your hand that share a color: Draw a card.";

export default defineCard({
  name: "Illuminated Folio",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, reveal: { count: 2, filter: {}, text: "cards", shareColor: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
