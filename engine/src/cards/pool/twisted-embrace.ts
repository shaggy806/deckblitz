import { defineCard } from "../define.js";

// EDHREC rank 15876.
//
// The bonus is gated on the enchanted permanent being a creature now (Born to
// Drive's shape): an enchanted noncreature artifact gets nothing.
const ENTER_TEXT = "When this Aura enters, destroy target creature or planeswalker an opponent controls.";
const PUMP_TEXT = "As long as enchanted permanent is a creature, it gets +1/+1.";

export default defineCard({
  name: "Twisted Embrace",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature you control\n${ENTER_TEXT}\n${PUMP_TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [1, 1],
      text: PUMP_TEXT,
    },
  ],
});
