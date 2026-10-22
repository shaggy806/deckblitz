import { defineCard } from "../define.js";

// Aether Revolt. Whether you control an artifact is checked as it resolves
// (its ruling).
export default defineCard({
  name: "Resourceful Return",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to your hand. If you control an artifact, draw a card.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
