import { defineCard } from "../define.js";

export default defineCard({
  name: "Time of Heroes",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Each creature you control with a level counter on it gets +2/+2.",
  static: [
    {
      // Any creature with a level counter, not only levelers; +2/+2 however
      // many (the rulings).
      affects: { scope: "creatures-you-control", withCounter: { kind: "level" } },
      grantPt: [2, 2],
      text: "Each creature you control with a level counter on it gets +2/+2.",
    },
  ],
});
