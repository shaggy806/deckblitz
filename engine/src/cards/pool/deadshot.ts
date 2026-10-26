import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 29761.
//
// Rulings:
//   [2004-10-04] Deadshot can target a creature which is already tapped as its first target, and
//     it will still damage the second target. This is because it taps that creature as an effect,
//     not as a cost.
//
// The tap is an effect, so an already-tapped first target still deals its
// damage (the ruling). The damage is Fall of the Hammer's one-sided fight —
// the first target's power to the second, nothing back.
export default defineCard({
  name: "Deadshot",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Tap target creature. It deals damage equal to its power to another target creature.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
