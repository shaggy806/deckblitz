import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 20216.
//
// Rulings:
//   [2007-05-01] Creatures with reach (such as Giant Spider) don't actually have flying, so they
//     can't block a creature enchanted with this.

const TEXT = "Enchanted creature gets +1/+1 and can't be blocked except by creatures with flying.";

export default defineCard({
  name: "Treetop Bracers",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature (Target a creature as you cast this. This card enters attached to that creature.)\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      cantBeBlockedBy: { notKeyword: "flying" },
      text: TEXT,
    },
  ],
});
