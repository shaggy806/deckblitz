import { defineCard } from "../define.js";

export default defineCard({
  name: "Mobilization",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Soldier creatures have vigilance.\n{2}{W}: Create a 1/1 white Soldier creature token.",
  static: [
    {
      affects: { scope: "all-creatures", subtype: "Soldier" },
      grantKeywords: ["vigilance"],
      text: "Soldier creatures have vigilance.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: "{2}{W}: Create a 1/1 white Soldier creature token.",
    },
  ],
});
