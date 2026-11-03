import { defineCard } from "../define.js";

// March of the Machine.
//
// Conditional indestructible on the `attackedBattleThisTurn` history clause:
// set as it's declared attacking a battle (rule 506.3), held for the rest of
// the turn whatever becomes of the battle (the card's ruling).
const TEXT = "This creature has indestructible as long as it attacked a battle this turn.";

export default defineCard({
  name: "War Historian",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attackedBattleThisTurn: true } },
      grantKeywords: ["indestructible"],
      text: TEXT,
    },
  ],
});
