import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 25623. "Elf creatures" is every player's.

export default defineCard({
  name: "Gempalm Strider",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  cycling: { cost: "{2}{G}{G}" },
  text: "Cycling {2}{G}{G} ({2}{G}{G}, Discard this card: Draw a card.)\nWhen you cycle this card, Elf creatures get +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Elf" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When you cycle this card, Elf creatures get +2/+2 until end of turn.",
    },
  ],
});
