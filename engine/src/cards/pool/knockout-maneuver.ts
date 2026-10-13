import { defineCard } from "../define.js";

// EDHREC rank 11167.
//
// Rulings:
//   [2025-04-04] You can't cast Knockout Maneuver unless you choose a creature you control and a
//     creature an opponent controls as targets.
//   [2025-04-04] If either creature is an illegal target as Knockout Maneuver resolves, the
//     creature you control won't deal damage. If the creature you control is an illegal target,
//     you won't put a +1/+1 counter on it even if it's still on the battlefield.

export default defineCard({
  name: "Knockout Maneuver",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control, then it deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  // The counter first, so "its power" counts it; the one-sided fight deals
  // nothing when either slot is illegal (the rulings).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
