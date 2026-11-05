import { defineCard } from "../define.js";

// EDHREC rank 13710.

export default defineCard({
  name: "Uril, the Miststalker",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\nUril gets +2/+2 for each Aura attached to it.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura", attachedTo: { isSource: true } }, pt: [2, 2] },
      text: "Uril gets +2/+2 for each Aura attached to it.",
    },
  ],
});
