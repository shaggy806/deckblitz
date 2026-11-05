import { defineCard } from "../define.js";

// Up to six lands, anyone's, chosen as it resolves (the ruling).
export default defineCard({
  name: "Time Spiral",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "Exile Time Spiral. Each player shuffles their hand and graveyard into their library, then draws seven cards. You untap up to six lands.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
      { kind: "draw", amount: 7, who: "each-player" },
      {
        kind: "choose-permanents",
        filter: { type: "land" },
        upTo: 6,
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to six lands",
      },
    ],
  },
});
