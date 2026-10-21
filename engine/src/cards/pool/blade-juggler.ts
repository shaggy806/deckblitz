import { defineCard } from "../define.js";

// EDHREC rank 23508.

const ENTERS_TEXT = "When this creature enters, it deals 1 damage to you and you draw a card.";

export default defineCard({
  name: "Blade Juggler",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  alternativeCost: {
    mana: "{2}{B}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: `Spectacle {2}{B} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "you" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
