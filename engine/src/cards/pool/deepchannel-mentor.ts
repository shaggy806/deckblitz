import { defineCard } from "../define.js";

export default defineCard({
  name: "Deepchannel Mentor",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 2,
  text: "Blue creatures you control can't be blocked.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["U"], controlledBy: "you" } },
      grantKeywords: ["unblockable"],
      text: "Blue creatures you control can't be blocked.",
    },
  ],
});
