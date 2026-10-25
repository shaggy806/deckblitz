import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Magic 2015. EDHREC rank 13216.
//
// The granted upkeep trigger is the equipped creature's own, so its
// controller draws on their own upkeep.

const STATIC_TEXT =
  'Equipped creature gets +2/+0 and has vigilance and "At the beginning of your upkeep, draw a card."';
const UPKEEP_TEXT = "At the beginning of your upkeep, draw a card.";
const DIES_TEXT = "Whenever equipped creature dies, target opponent gains control of this Equipment.";

export default defineCard({
  name: "Avarice Amulet",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${DIES_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["vigilance"],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: ["opponent"],
      effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: { target: 0 } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
