import { defineCard } from "../define.js";

export default defineCard({
  name: "Hagra Broodpit",
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {B}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Hagra Mauling", "Hagra Broodpit"],
});
