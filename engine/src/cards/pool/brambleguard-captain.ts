import { defineCard } from "../define.js";

// EDHREC rank 11911.
//
// Rulings:
//   [2024-07-26] If Brambleguard Captain’s power is negative as its ability resolves, the target
//     creature will get +0/+0 until end of turn. At least they’ll know Brambleguard Captain
//     appreciates them.
//   [2024-07-26] The value of X is calculated only once, as Brambleguard Captain’s ability
//     resolves.
//
// War Machine, Legacy of Iron's shape, but any creature you control — the
// Captain itself included. X is read once, on resolution, and a `powerOf`
// pump is clamped at 0 (rule 107.1b — the first ruling).

const TEXT =
  "At the beginning of combat on your turn, target creature you control gets +X/+0 until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Brambleguard Captain",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: { powerOf: "source" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
