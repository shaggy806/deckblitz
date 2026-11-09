import { defineCard } from "../define.js";

// EDHREC rank 21445.
export default defineCard({
  name: "Clear the Land",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player reveals the top five cards of their library, puts all land cards revealed this way onto the battlefield tapped, and exiles the rest.",
  effect: {
    kind: "for-each-player",
    who: "each-player",
    // Held: every land enters at once, after every player has revealed.
    choicesHeld: true,
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "library",
      count: 5,
      reveal: true,
      min: 5,
      max: 5,
      filter: { type: "land" },
      destination: "battlefield",
      enterTapped: true,
      leftover: "exile",
    },
  },
});
