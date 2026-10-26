import { defineCard } from "../define.js";

// A reveal land: a changeling card in hand counts (rule 702.73a —
// `revealableFromHand` reads layer-4 subtypes).
export default defineCard({
  name: "Wanderwine Hub",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may reveal a Merfolk card from your hand. If you don't, this land enters tapped.\n{T}: Add {W} or {U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnlessRevealFromHand: ["Merfolk"] },
      text: "As this land enters, you may reveal a Merfolk card from your hand. If you don't, this land enters tapped.",
    },
  ],
});
