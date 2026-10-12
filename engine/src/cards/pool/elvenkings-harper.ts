import { defineCard } from "../define.js";

export default defineCard({
  name: "Elvenking's Harper",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Bard"],
  power: 2,
  toughness: 2,
  text: "{4}{U}: Target creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{4}{U}: Target creature can't be blocked this turn.",
    },
  ],
});
