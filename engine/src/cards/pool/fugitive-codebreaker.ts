import { defineCard } from "../define.js";

// EDHREC rank 19207.
const UP_TEXT = "When this creature is turned face up, discard your hand, then draw three cards.";

export default defineCard({
  name: "Fugitive Codebreaker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Prowess, haste\nDisguise {5}{R}. This cost is reduced by {1} for each instant and sorcery card in your graveyard.\n${UP_TEXT}`,
  morph: {
    keyword: "disguise",
    cost: "{5}{R}",
    costReduction: { cardsInGraveyard: { typesAnyOf: ["instant", "sorcery"] } },
  },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess",
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 3 },
        ],
      },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
