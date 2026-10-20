import { defineCard } from "../define.js";

// EDHREC rank 14967. Angel of Vitality's two statics, with +2/+1.
//
// Rulings (selected):
//   [2021-04-16] If you control two Honor Trolls and you would gain life, you gain that much life
//     plus 2. A third Honor Troll has you gain that much life plus 3, and so on.
//   [2021-04-16] The middle ability of Honor Troll applies just once to each life-gaining event,
//     whether it's 1 life from Impassioned Orator or 4 life from Dawning Angel.
export default defineCard({
  name: "Honor Troll",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Druid"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nIf you would gain life, you gain that much life plus 1 instead.\nThis creature gets +2/+1 as long as you have 25 or more life.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", plus: 1 },
      text: "If you would gain life, you gain that much life plus 1 instead.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", atLeast: 25 },
      grantPt: [2, 1],
      text: "This creature gets +2/+1 as long as you have 25 or more life.",
    },
  ],
});
