import { defineCard } from "../define.js";

// EDHREC rank 27461. Hour of Devastation. No land you control untaps during
// your next untap step, those that arrive later included (the rulings).
export default defineCard({
  name: "Rhonas's Last Stand",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 5/4 green Snake creature token. Lands you control don't untap during your next untap step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "5/4 Snake Token", count: 1 },
      { kind: "skip-next-untap", filter: { type: "land" } },
    ],
  },
});
