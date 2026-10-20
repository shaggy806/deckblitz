import { defineCard } from "../define.js";

// EDHREC rank 20804.
//
// Kicked, `kicker.effect` replaces the spell's effect: +5/+5 instead of +3/+3.

export default defineCard({
  name: "Might of Murasa",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {2}{G} (You may pay an additional {2}{G} as you cast this spell.)\nTarget creature gets +3/+3 until end of turn. If this spell was kicked, that creature gets +5/+5 until end of turn instead.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
  kicker: {
    cost: "{2}{G}",
    effect: { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
  },
});
