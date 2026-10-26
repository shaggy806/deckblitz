import { defineCard } from "../define.js";

// EDHREC rank 5119.

export default defineCard({
  name: "Secluded Glen",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may reveal a Faerie card from your hand. If you don't, this land enters tapped.\n{T}: Add {U} or {B}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "B"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U} or {B}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnlessRevealFromHand: ["Faerie"] },
      text: "As this land enters, you may reveal a Faerie card from your hand. If you don't, this land enters tapped.",
    },
  ],
});
