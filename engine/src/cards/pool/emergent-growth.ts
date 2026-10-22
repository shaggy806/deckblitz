import { defineCard } from "../define.js";

// EDHREC rank 24322. Compelled Duel at +5/+5.
export default defineCard({
  name: "Emergent Growth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature gets +5/+5 until end of turn and must be blocked this turn if able.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});
