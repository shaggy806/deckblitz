import { defineCard } from "../define.js";

const ENTERS =
  "When this Aura enters, remove enchanted creature from combat. Then draw a card for each tapped creature its controller controls.";
const STATIC = "Enchanted creature loses all abilities and can't attack or block.";

export default defineCard({
  name: "Observed Stasis",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature an opponent controls\n${ENTERS}\n${STATIC}`,
  targets: ["creature-an-opponent-controls"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-from-combat", target: "attached" },
          {
            kind: "draw",
            amount: { countOf: { type: "creature", tapped: true, controlledBy: "you" }, forPlayer: "attached-controller" },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      restrictions: ["cant-attack", "cant-block"],
      text: STATIC,
    },
  ],
});
