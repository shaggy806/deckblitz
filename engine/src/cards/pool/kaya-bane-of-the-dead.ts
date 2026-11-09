import { defineCard } from "../define.js";

export default defineCard({
  name: "Kaya, Bane of the Dead",
  manaCost: "{3}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaya"],
  loyalty: 7,
  text: "Your opponents and permanents your opponents control with hexproof can be the targets of spells and abilities you control as though they didn't have hexproof.\n\u22123: Exile target creature.",
  static: [
    {
      affects: { scope: "self" },
      targetsIgnoringHexproof: { object: { controlledBy: "opponent" }, players: "opponents" },
      text: "Your opponents and permanents your opponents control with hexproof can be the targets of spells and abilities you control as though they didn't have hexproof.",
    },
  ],
  activated: [
    { loyaltyCost: -3, cost: { mana: null, tap: false }, targets: ["creature"], effect: { kind: "exile", target: 0 }, resolve: null, text: "\u22123: Exile target creature." },
  ],
});
