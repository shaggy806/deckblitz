import { defineCard } from "../define.js";

// Each of two players controls the other's next turn. Its caster needn't be
// either. A target gone illegal leaves the other half: nobody to control them,
// or nobody to be controlled.
export default defineCard({
  name: "Cruel Entertainment",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose target player and another target player. The first player controls the second player during the second player's next turn, and the second player controls the first player during the first player's next turn.",
  targets: ["player", { kind: "other", of: "player", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "control-player", target: 1, controller: 0 },
      { kind: "control-player", target: 0, controller: 1 },
    ],
  },
});
