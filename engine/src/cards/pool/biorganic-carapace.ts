import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8107.
//
// Rulings:
//   [2025-09-19] The number of modified creatures you control is counted at the time the ability
//     resolves, not the time that damage was dealt.
//   [2025-09-19] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2025-09-19] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//   [2025-09-19] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.

// Vibranium Strike Gauntlets' granted draw, counting `modified` creatures
// (rule 700.9 — the filter reads the rulings' three cases) as it resolves.
const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const GRANTED_TEXT =
  "Whenever this creature deals combat damage to a player, draw a card for each modified creature you control.";
const STATIC_TEXT = `Equipped creature gets +2/+2 and has "${GRANTED_TEXT}" (Equipment, Auras you control, and counters are modifications.)`;

export default defineCard({
  name: "Biorganic Carapace",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {2}`,
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
      grantPt: [2, 2],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "draw",
            amount: { countOf: { type: "creature", controlledBy: "you", modified: true } },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
