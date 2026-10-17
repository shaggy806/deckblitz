import { defineCard } from "../define.js";

const GRANTED_TEXT = "Whenever this creature attacks, create a Monster Role token attached to up to one target attacking creature.";
const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

// The granted trigger is the enchanted creature's: its controller makes the
// Role (and so it replaces their own Role on the target). The return is
// Rancor's.
export default defineCard({
  name: "Giant Inheritance",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +5/+5 and has "${GRANTED_TEXT}"\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [5, 5],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
          effect: { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Enchanted creature gets +5/+5 and has "${GRANTED_TEXT}"`,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
