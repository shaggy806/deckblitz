import { defineCard } from "../define.js";

const PUMP = "Equipped creature gets +2/+2 and has menace.";
const DAMAGE =
  "Whenever equipped creature deals combat damage to a player, draw two cards. Then discard two cards unless you discard a Pirate card.";
const EQUIP = "Equip {2}. This ability costs {2} less to activate if you have one or fewer cards in hand.";

export default defineCard({
  name: "Arm-Mounted Anchor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${DAMAGE}\n${EQUIP}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["menace"],
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2, unlessOne: { subtype: "Pirate" } },
        ],
      },
      resolve: null,
      text: DAMAGE,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      costReduction: { reduceGeneric: 2, condition: { kind: "hand-size", atMost: 1 } },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: EQUIP,
    },
  ],
});
