import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 24081.
//
// "Creatures you control that are enchanted": any Aura, whoever controls it
// (rule 303.4), so the filter is `enchanted`, not `enchantedBy`.

export default defineCard({
  name: "Guardian's Magemark",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nCreatures you control that are enchanted get +1/+1.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      grantPt: [1, 1],
      text: "Creatures you control that are enchanted get +1/+1.",
    },
  ],
});
