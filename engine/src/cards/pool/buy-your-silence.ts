import { defineCard } from "../define.js";

// EDHREC rank 23842. Streets of New Capenna. Its controller is the exiled
// permanent's last controller (rule 608.2h) — Stroke of Midnight's shape.
export default defineCard({
  name: "Buy Your Silence",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: 'Exile target nonland permanent. Its controller creates a Treasure token. (It\'s an artifact with "{T}, Sacrifice this token: Add one mana of any color.")',
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Treasure Token", count: 1, who: "target-controller" },
    ],
  },
});
