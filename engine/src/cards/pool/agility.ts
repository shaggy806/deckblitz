import { defineCard } from "../define.js";
import { flanking } from "../helpers.js";

// Mirage (MIR). EDHREC rank 24524.
//
// Rulings:
//   If the enchanted creature already has Flanking, its effect is cumulative.
//
// The Aura grants both halves of flanking: the keyword (what another
// creature's flanking asks about) and the trigger itself (`grantsTriggered`),
// so a creature that already has flanking triggers twice (rule 702.25b).

const TEXT =
  "Enchanted creature gets +1/+1 and has flanking. (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)";

export default defineCard({
  name: "Agility",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flanking"],
      grantsTriggered: [flanking()],
      text: TEXT,
    },
  ],
});
