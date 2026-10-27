import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 26586.
//
// Kicked, `kicker.effect` replaces the spell's effect: +5/+5 instead of +2/+2.

export default defineCard({
  name: "Explosive Growth",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {5} (You may pay an additional {5} as you cast this spell.)\nTarget creature gets +2/+2 until end of turn. If this spell was kicked, that creature gets +5/+5 until end of turn instead.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  kicker: {
    cost: "{5}",
    effect: { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
  },
});
