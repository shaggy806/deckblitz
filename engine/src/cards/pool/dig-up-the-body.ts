import { defineCard } from "../define.js";

// Any creature card in the graveyard may come back, not only one milled by
// this spell (the ruling).
export default defineCard({
  name: "Dig Up the Body",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  casualty: 1,
  text:
    "Casualty 1 (As you cast this spell, you may sacrifice a creature with power 1 or greater. When you do, copy this spell.)\n" +
    "Mill two cards, then you may return a creature card from your graveyard to your hand. (To mill a card, put the top card of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 2 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { type: "creature" },
      },
    ],
  },
});
