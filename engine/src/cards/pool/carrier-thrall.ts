import { defineCard } from "../define.js";

// EDHREC rank 8846.

const TEXT =
  'When this creature dies, create a 1/1 colorless Eldrazi Scion creature token. It has "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Carrier Thrall",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
