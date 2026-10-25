import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 12607.

export default defineCard({
  name: "Belligerent Sliver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "Sliver creatures you control have menace. (They can't be blocked except by two or more creatures.)",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantKeywords: ["menace"],
      text: "Sliver creatures you control have menace.",
    },
  ],
});
