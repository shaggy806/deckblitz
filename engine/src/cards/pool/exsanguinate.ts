import { defineCard } from "../define.js";

export default defineCard({
  name: "Exsanguinate",
  // Pinned: Scryfall answers "Exsanguinate" by name with Stensian Sanguinist // Exsanguinate, whose
  // prepare spell or adventure shares the name.
  art: "f11d7311-4066-4a5d-ba28-9857fa707a0b",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each opponent loses X life. You gain life equal to the life lost this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: "x", who: "each-opponent" },
      {
        // "The life lost this way": all of it, and an opponent driven to 0
        // or below still counts — they only leave the game at the next
        // state-based check, after this has resolved (the 2011-01-01
        // ruling: 3 and 10 life, X = 4, gain 8).
        kind: "gain-life",
        amount: { lifeLostThisWay: true, who: "each-opponent" },
      },
    ],
  },
});
