import { defineCard } from "../define.js";

// A reveal land: a changeling card in hand counts (rule 702.73a —
// `revealableFromHand` reads layer-4 subtypes).
export default defineCard({
  name: "Auntie's Hovel",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may reveal a Goblin card from your hand. If you don't, this land enters tapped.\n{T}: Add {B} or {R}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {R}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnlessRevealFromHand: ["Goblin"] },
      text: "As this land enters, you may reveal a Goblin card from your hand. If you don't, this land enters tapped.",
    },
  ],
});
