import { defineCard } from "../define.js";

// One enters trigger with two targets: the attach is to up to one creature you
// control (an empty slot attaches nothing), and the tap reads "creatures" from
// the target opponent's side (`tap-all`'s `controlledByTarget`).
const ENTER_TEXT =
  "When this Equipment enters, attach it to up to one target creature you control. Tap all creatures target opponent controls.";
const LOOT_TEXT = "Whenever this creature deals combat damage to a player, draw a card, then discard a card.";
const STATIC_TEXT = `Equipped creature gets +1/+1 and has "${LOOT_TEXT}"`;

export default defineCard({
  name: "Assassin Gauntlet",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-you-control" }, "opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0, attachment: "source" },
          { kind: "tap-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "discard", target: "you", amount: 1 },
            ],
          },
          resolve: null,
          text: LOOT_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
