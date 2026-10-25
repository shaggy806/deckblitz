import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 20153.
//
// Rulings:
//   [2014-07-18] You can remove any +1/+1 counters from Cruel Sadist to activate its second
//     ability, not just those put on Cruel Sadist by its first ability.
export default defineCard({
  name: "Cruel Sadist",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  text: "{B}, {T}, Pay 1 life: Put a +1/+1 counter on this creature.\n{2}{B}, {T}, Remove X +1/+1 counters from this creature: It deals X damage to target creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: true, payLife: 1 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{B}, {T}, Pay 1 life: Put a +1/+1 counter on this creature.",
    },
    {
      cost: { mana: "{2}{B}", tap: true, removeCounter: { kind: "+1/+1", count: "x" } },
      targets: ["creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "{2}{B}, {T}, Remove X +1/+1 counters from this creature: It deals X damage to target creature.",
    },
  ],
});
