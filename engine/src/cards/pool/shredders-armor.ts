import { defineCard } from "../define.js";

// EDHREC rank 19542.
//
// Equip's cost is "Sacrifice another nonland permanent" (`otherOnly` keeps
// the Equipment itself out), once each turn; equip is sorcery-speed (rule
// 702.6a).

const ENTERS_TEXT = "When this Equipment enters, attach it to target creature you control.";
const EQUIP_TEXT = "Equip—Sacrifice another nonland permanent. Activate only once each turn.";

export default defineCard({
  name: "Shredder's Armor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+1.\n${ENTERS_TEXT}\n${EQUIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { notTypes: ["land"] } } },
      otherOnly: true,
      oncePerTurn: true,
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
    },
  ],
});
