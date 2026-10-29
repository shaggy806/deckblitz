import { defineCard } from "../define.js";

// Rulings:
//   [2006-07-15] Gelid Shackles doesn't stop static abilities or triggered abilities from working.
//     It also won't prevent the creature from attacking unless the enchanted creature is given
//     defender before attackers are declared.

export default defineCard({
  name: "Gelid Shackles",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't block, and its activated abilities can't be activated.\n{S}: Enchanted creature gains defender until end of turn. ({S} can be paid with one mana from a snow source.)",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "defender", duration: "end-of-turn" },
      resolve: null,
      text: "{S}: Enchanted creature gains defender until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't block, and its activated abilities can't be activated.",
    },
  ],
});
