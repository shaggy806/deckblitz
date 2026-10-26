import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 18387.
//
// A Magemark: every creature its controller controls with any Aura on it
// (`enchanted`, whoever controls the Aura — rule 303.4), not just the one it
// enchants.

const TEXT = "Creatures you control that are enchanted get +1/+1 and can't be blocked except by creatures with defender.";

export default defineCard({
  name: "Infiltrator's Magemark",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      grantPt: [1, 1],
      cantBeBlockedBy: { notKeyword: "defender" },
      text: TEXT,
    },
  ],
});
