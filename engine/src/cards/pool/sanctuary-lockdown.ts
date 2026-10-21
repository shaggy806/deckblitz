import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Humans you control get +1/+1.";
const TAP_TEXT = "{2}, Tap two untapped Humans you control: Tap target creature an opponent controls.";

export default defineCard({
  name: "Sanctuary Lockdown",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${TAP_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Human" },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        tapOthers: { count: 2, filter: { subtype: "Human", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
