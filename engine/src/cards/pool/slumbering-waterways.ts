import { defineCard } from "../define.js";

export default defineCard({
  name: "Slumbering Waterways",
  colors: [],
  types: ["land"],
  keywords: ["flying", "vigilance", "trample"],
  text: "Slumbering Waterways enters the battlefield tapped.\n{T}: Add {G} or {U}.\nFlying, vigilance, trample",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {U}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Slumbering Waterways enters the battlefield tapped.",
    },
  ],
});
