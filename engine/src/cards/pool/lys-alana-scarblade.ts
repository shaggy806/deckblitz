import { defineCard } from "../define.js";

const TEXT =
  "{T}, Discard an Elf card: Target creature gets -X/-X until end of turn, where X is the number of Elves you control.";

// X is counted as the ability resolves, itself included (the ruling).
const ELVES = { countOf: { subtype: "Elf", controlledBy: "you" } } as const;

export default defineCard({
  name: "Lys Alana Scarblade",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Assassin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1, filter: { subtype: "Elf" } } },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [ELVES, -1] },
        toughness: { product: [ELVES, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
