import { defineCard } from "../define.js";

// EDHREC rank 21801. The Aura's controller gets the Myr whoever controlled
// and sacrificed the creature (the ruling).
const TEXT =
  "At the beginning of your upkeep, enchanted creature's controller sacrifices it and you create a 1/1 colorless Phyrexian Myr artifact creature token.";

export default defineCard({
  name: "Parasitic Implant",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-target", target: "attached", byItsController: true },
          { kind: "create-token", token: "Phyrexian Myr Token (Myr Sire)", count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
