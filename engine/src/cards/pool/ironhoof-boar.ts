import { defineCard } from "../define.js";

export default defineCard({
  name: "Ironhoof Boar",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Boar"],
  power: 5,
  toughness: 4,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nChannel — {1}{R}, Discard this card: Target creature gets +3/+1 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Channel — {1}{R}, Discard this card: Target creature gets +3/+1 and gains trample until end of turn.",
      zone: "hand",
    },
  ],
});
