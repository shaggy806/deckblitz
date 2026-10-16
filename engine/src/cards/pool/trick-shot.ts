import { defineCard } from "../define.js";

// EDHREC rank 20737. Conduct Electricity's shape, except the token is an
// "other" target: never the same creature as the first.
export default defineCard({
  name: "Trick Shot",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Trick Shot deals 6 damage to target creature and 2 damage to up to one other target creature token.",
  targets: [
    "creature",
    {
      kind: "optional",
      of: { kind: "other", of: { kind: "permanent", filter: { type: "creature", token: true } }, than: { slot: 0 } },
    },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
