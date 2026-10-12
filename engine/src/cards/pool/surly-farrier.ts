import { defineCard } from "../define.js";

export default defineCard({
  name: "Surly Farrier",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Citizen"],
  power: 2,
  toughness: 2,
  text: "{T}: Target creature you control gets +1/+1 and gains vigilance until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{T}: Target creature you control gets +1/+1 and gains vigilance until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
