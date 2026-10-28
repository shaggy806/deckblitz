import { defineCard } from "../define.js";

// EDHREC rank 3617.
//
// Primal Beyond's reveal replacement: the hand is read through `hasSubtype`,
// so a changeling card counts as an Elemental card (rule 702.73a, 604.3).

const REVEAL_TEXT =
  "As this land enters, you may reveal an Elemental card from your hand. If you don't, this land enters tapped.";

export default defineCard({
  name: "Flamekin Village",
  colors: [],
  types: ["land"],
  text: `${REVEAL_TEXT}\n{T}: Add {R}.\n{R}, {T}: Target creature gains haste until end of turn.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnlessRevealFromHand: ["Elemental"] },
      text: REVEAL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{R}, {T}: Target creature gains haste until end of turn.",
    },
  ],
});
