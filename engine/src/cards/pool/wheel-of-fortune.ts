import { defineCard } from "../define.js";

export default defineCard({
  name: "Wheel of Fortune",
  // Pinned: Scryfall answers "Wheel of Fortune" by name with Naktamun Lorespinner // Wheel of Fortune, whose
  // prepare spell or adventure shares the name.
  art: "2597050f-6b1b-474e-aa16-33fd154628ca",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player discards their hand, then draws seven cards.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "each-player" },
      { kind: "draw", amount: 7, who: "each-player" },
    ],
  },
});
