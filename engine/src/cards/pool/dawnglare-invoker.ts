import { defineCard } from "../define.js";

const TAP_TEXT = "{8}: Tap all creatures target player controls.";

export default defineCard({
  name: "Dawnglare Invoker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: ["player"],
      effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
