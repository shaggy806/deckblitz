import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 25769.
//
// "Creatures you control that are enchanted": any Aura, whoever controls it
// (rule 303.4), so the filter is `enchanted`, not `enchantedBy`.
//
// Rulings:
//   [2006-02-01] Each Magemark gives its bonus to the creature it's attached to, as long as the
//     same player controls both the creature and the Aura.

export default defineCard({
  name: "Fencer's Magemark",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nCreatures you control that are enchanted get +1/+1 and have first strike.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: "Creatures you control that are enchanted get +1/+1 and have first strike.",
    },
  ],
});
