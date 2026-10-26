import { defineCard } from "../define.js";

// EDHREC rank 4949.

export default defineCard({
  name: "Gilt-Leaf Palace",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may reveal an Elf card from your hand. If you don't, this land enters tapped.\n{T}: Add {B} or {G}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {G}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnlessRevealFromHand: ["Elf"] },
      text: "As this land enters, you may reveal an Elf card from your hand. If you don't, this land enters tapped.",
    },
  ],
});
