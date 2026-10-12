import { defineCard } from "../define.js";

export default defineCard({
  name: "Soltari Crusader",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Knight"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\n{1}{W}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: This creature gets +1/+0 until end of turn.",
    },
  ],
});
