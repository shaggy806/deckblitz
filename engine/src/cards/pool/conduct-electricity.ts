import { defineCard } from "../define.js";

// EDHREC rank 15665. Two damages dealt at once (Boulder Dash's `simultaneous`
// sequence); the second slot isn't "other", so it may be the same creature as
// the first as long as that creature is a token (the ruling, rule 115.3).
export default defineCard({
  name: "Conduct Electricity",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Conduct Electricity deals 6 damage to target creature and 2 damage to up to one target creature token.",
  targets: ["creature", { kind: "optional", of: { kind: "permanent", filter: { type: "creature", token: true } } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
