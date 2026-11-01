import { defineCard } from "../define.js";

export default defineCard({
  name: "Dark Matter Manipulator",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 2,
  text: "When this creature enters, mill three cards.\nThis creature gets +2/+0 for every seven cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { ownedBy: "you" }, step: 7, pt: [2, 0] },
      text: "This creature gets +2/+0 for every seven cards in your graveyard.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: "When this creature enters, mill three cards.",
    },
  ],
});
