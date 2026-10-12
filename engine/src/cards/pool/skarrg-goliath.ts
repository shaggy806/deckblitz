import { defineCard } from "../define.js";

export default defineCard({
  name: "Skarrg Goliath",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 9,
  toughness: 9,
  keywords: ["trample"],
  text: "Trample\nBloodrush — {5}{G}{G}, Discard this card: Target attacking creature gets +9/+9 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{5}{G}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 9, toughness: 9, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Bloodrush — {5}{G}{G}, Discard this card: Target attacking creature gets +9/+9 and gains trample until end of turn.",
      zone: "hand",
    },
  ],
});
