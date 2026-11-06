import { defineCard } from "../define.js";

// EDHREC rank 28265.

export default defineCard({
  name: "Vulcan",
  colors: [],
  types: ["land"],
  subtypes: ["Planet"],
  text: "This land enters tapped.\nWhen this land enters, you gain 1 life.\n{T}: Add {W} or {U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "When this land enters, you gain 1 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
