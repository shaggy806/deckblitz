import { defineCard } from "../define.js";

// EDHREC rank 8076. Kaldheim. Any nontoken Elf or Berserker you control,
// a kindred one included — not only creatures.

const TEXT = "Whenever another nontoken Elf or Berserker you control dies, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Skemfar Avenger",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Berserker"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { token: false, subtypes: ["Elf", "Berserker"] },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
