import { defineCard } from "../define.js";

// EDHREC rank 14876.

export default defineCard({
  name: "Lotleth Troll",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Troll"],
  power: 2,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nDiscard a creature card: Put a +1/+1 counter on this creature.\n{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Discard a creature card: Put a +1/+1 counter on this creature.",
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
});
