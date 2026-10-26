import { defineCard } from "../define.js";

const REVEAL_TEXT = "As this land enters, you may reveal a Giant card from your hand. If you don't, this land enters tapped.";

export default defineCard({
  name: "Ancient Amphitheater",
  colors: [],
  types: ["land"],
  text: `${REVEAL_TEXT}\n{T}: Add {R} or {W}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {W}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnlessRevealFromHand: ["Giant"] },
      text: REVEAL_TEXT,
    },
  ],
});
