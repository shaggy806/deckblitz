import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 28393. "Soldier creatures" is every player's.

export default defineCard({
  name: "Gempalm Avenger",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 5,
  cycling: { cost: "{2}{W}" },
  text: "Cycling {2}{W} ({2}{W}, Discard this card: Draw a card.)\nWhen you cycle this card, Soldier creatures get +1/+1 and gain first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", subtype: "Soldier" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", subtype: "Soldier" },
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When you cycle this card, Soldier creatures get +1/+1 and gain first strike until end of turn.",
    },
  ],
});
