import { defineCard } from "../define.js";

// EDHREC rank 15962. "Must be blocked this turn if able" asks for one blocker
// only, and none when no creature can block it or blocking it costs something
// (the rulings) — the `must-be-blocked-if-able` restriction's own reading.
export default defineCard({
  name: "Compelled Duel",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature gets +3/+3 until end of turn and must be blocked this turn if able.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});
