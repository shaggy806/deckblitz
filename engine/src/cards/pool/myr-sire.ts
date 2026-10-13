import { defineCard } from "../define.js";

// EDHREC rank 6983.

export default defineCard({
  name: "Myr Sire",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Myr"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, create a 1/1 colorless Phyrexian Myr artifact creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Myr Token (Myr Sire)", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 1/1 colorless Phyrexian Myr artifact creature token.",
    },
  ],
});
