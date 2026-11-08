import { defineCard } from "../define.js";

// During that player's next turn — not this one, if it is theirs — each
// creature they control as they declare attackers, one that entered since
// included, must attack you if it can (rule 508.1d).
const TEXT = "During target player's next turn, creatures that player controls attack you if able.";

export default defineCard({
  name: "Taunt",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "attack-requirement",
    filter: { type: "creature" },
    controlledByTarget: 0,
    attacks: "you",
    duration: { duringTurnOf: { target: 0 } },
  },
});
