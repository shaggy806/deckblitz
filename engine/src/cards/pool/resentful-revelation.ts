import { defineCard } from "../define.js";

// EDHREC rank 6755. Forbidden Alchemy's shape, over three cards.
export default defineCard({
  name: "Resentful Revelation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.\n" +
    "Flashback {6}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  flashback: { cost: "{6}{B}" },
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "graveyard",
  },
});
