import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 13736.
// Allies at Last's one-sided fights, dealt at once, after the taps. A
// creature of yours that's no longer a legal target as the spell resolves
// (gone, or tapped by then) deals no damage; with the opponent's creature
// illegal, none is dealt (the ruling).
const UNTAPPED_YOURS: TargetSpec = { kind: "permanent", whose: "you", filter: { type: "creature", tapped: false } };

export default defineCard({
  name: "Coordinated Clobbering",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Tap one or two target untapped creatures you control. They each deal damage equal to their power to target creature an opponent controls.",
  targets: [
    UNTAPPED_YOURS,
    { kind: "optional", of: { kind: "other", of: UNTAPPED_YOURS, than: { slots: [0] } } },
    "creature-an-opponent-controls",
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "fight", a: 0, b: 2, oneSided: true },
          { kind: "fight", a: 1, b: 2, oneSided: true },
        ],
      },
    ],
  },
});
