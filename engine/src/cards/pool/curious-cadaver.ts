import { defineCard } from "../define.js";

// An ability that works only while this card is in your graveyard (rule
// 113.6k): any Clue you sacrifice, for any reason — a Clue artifact that
// isn't a token too (the rulings).

const TEXT = "When you sacrifice a Clue, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Curious Cadaver",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Detective"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
