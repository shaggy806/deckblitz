import { defineCard } from "../define.js";

export default defineCard({
  name: "Troll Ascetic",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Shaman"],
  power: 3,
  toughness: 2,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\n{1}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate this creature.",
    },
  ],
});
