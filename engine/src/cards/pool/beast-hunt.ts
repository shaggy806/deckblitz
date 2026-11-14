import { defineCard } from "../define.js";

// EDHREC rank 28107. Mulch's shape: every creature card revealed goes to the
// hand, the rest to the graveyard; with fewer than three cards, all of them
// are revealed (the ruling).
export default defineCard({
  name: "Beast Hunt",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top three cards of your library. Put all creature cards revealed this way into your hand and the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    reveal: true,
    min: 3,
    max: 3,
    filter: { type: "creature" },
    destination: "hand",
    leftover: "graveyard",
  },
});
