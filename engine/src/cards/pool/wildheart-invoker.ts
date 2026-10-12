import { defineCard } from "../define.js";

export default defineCard({
  name: "Wildheart Invoker",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 4,
  toughness: 3,
  text: "{8}: Target creature gets +5/+5 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{8}: Target creature gets +5/+5 and gains trample until end of turn.",
    },
  ],
});
