import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] The Aura will be put into the graveyard if you lose control of the creature or if
//     it somehow becomes a Wall.

const ENTERS = "When this Aura enters, draw a card at the beginning of the next turn's upkeep.";
const TAP =
  "Tap enchanted creature: This Aura deals 1 damage to any target. Put a -0/-1 counter on enchanted creature. Activate only if enchanted creature is untapped.";

export default defineCard({
  name: "Krovikan Plague",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant non-Wall creature you control\n${ENTERS}\n${TAP}`,
  targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notSubtypes: ["Wall"] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "delayed-trigger", at: { step: "upkeep" }, effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { hostOfSource: true } } },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", target: 0, amount: 1 },
          { kind: "add-counter", target: "attached", counter: "-0/-1", amount: 1 },
        ],
      },
      resolve: null,
      text: TAP,
    },
  ],
});
