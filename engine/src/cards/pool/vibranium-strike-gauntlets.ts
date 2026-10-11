import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11117. Marvel Super Heroes Commander.
//
// Cliffhaven Kitesail's enters-attach, and Power Fist's granted "this
// creature deals combat damage to a player" trigger.
const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const GRANTED_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";
const STATIC_TEXT = `Equipped creature gets +3/+0 and has trample and "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Vibranium Strike Gauntlets",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      grantKeywords: ["trample"],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
