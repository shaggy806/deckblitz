import { defineCard } from "../define.js";

// EDHREC rank 5187. Each colour's bonus is its own conditional static, so a
// creature both blue and black gets both (the ruling). The granted triggers
// are the creature's own: "an opponent" is its controller's opponent, any
// damage, and the colour matters only as the damage is dealt.

const BLUE_TEXT =
  'As long as enchanted creature is blue, it gets +1/+1 and has "Whenever this creature deals damage to an opponent, draw a card."';
const BLACK_TEXT =
  'As long as enchanted creature is black, it gets +1/+1 and has "Whenever this creature deals damage to an opponent, that player discards a card."';

export default defineCard({
  name: "Helm of the Ghastlord",
  manaCost: "{3}{U/B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BLUE_TEXT}\n${BLACK_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["U"] } } },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", to: "opponent" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals damage to an opponent, draw a card.",
        },
      ],
      text: BLUE_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["B"] } } },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", to: "opponent" },
          targets: [],
          effect: { kind: "discard", target: "trigger-player", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals damage to an opponent, that player discards a card.",
        },
      ],
      text: BLACK_TEXT,
    },
  ],
});
