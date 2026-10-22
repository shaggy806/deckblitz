import { defineCard } from "../define.js";

// EDHREC rank 25008.
//
// Rulings:
//   [2017-09-29] You can choose one Merfolk creature as both targets for River Heralds' Boon. You
//     can also choose two different Merfolk creatures.
//
// Two separate target slots (no "other"), so one Merfolk may be both.

export default defineCard({
  name: "River Heralds' Boon",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature and a +1/+1 counter on up to one target Merfolk.",
  targets: ["creature", { kind: "optional", of: { kind: "permanent", filter: { subtype: "Merfolk" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
