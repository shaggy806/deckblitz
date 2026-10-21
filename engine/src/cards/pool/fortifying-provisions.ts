import { defineCard } from "../define.js";

// EDHREC rank 19521. Throne of Eldraine.

export default defineCard({
  name: "Fortifying Provisions",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Creatures you control get +0/+1.\nWhen this enchantment enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [0, 1],
      text: "Creatures you control get +0/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When this enchantment enters, create a Food token.",
    },
  ],
});
