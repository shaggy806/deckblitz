import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] It is put into the graveyard if you lose control of the creature.

const UNTAP = "{0}: Untap enchanted creature. Activate only during your turn and only once each turn.";
const TAP =
  "Tap enchanted creature: Untap target artifact, creature, or land. Activate only if enchanted creature is white and untapped and only once each turn.";

export default defineCard({
  name: "Nature's Chosen",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${UNTAP}\n${TAP}`,
  targets: ["creature-you-control"],
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      condition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: UNTAP,
    },
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { hostOfSource: true } } },
      condition: { kind: "source", filter: { attachedTo: { colors: ["W"] } } },
      oncePerTurn: true,
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: TAP,
    },
  ],
});
