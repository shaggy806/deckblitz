import { defineCard } from "../define.js";

// Chapters II and III each set up a turn-long delayed trigger, which belongs
// to no permanent and so outlives the Saga's sacrifice after III.

const SEA_TYPES = ["Kraken", "Leviathan", "Merfolk", "Octopus", "Serpent"];
const BOUNCE_TEXT =
  "I — Return each creature that isn't a Kraken, Leviathan, Merfolk, Octopus, or Serpent to its owner's hand.";
const DRAW_TEXT =
  "II, III — Until end of turn, whenever a Kraken, Leviathan, Merfolk, Octopus, or Serpent attacks, draw a card.";

export default defineCard({
  name: "Summon: Leviathan",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Leviathan"],
  power: 6,
  toughness: 6,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${BOUNCE_TEXT}\n${DRAW_TEXT}\nWard {2}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "return-to-hand-all", filter: { type: "creature", notSubtypes: SEA_TYPES } },
      resolve: null,
      text: BOUNCE_TEXT,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks", who: "any", filter: { subtypes: SEA_TYPES } } },
        effect: { kind: "draw", amount: 1 },
        text: "Whenever a Kraken, Leviathan, Merfolk, Octopus, or Serpent attacks this turn, draw a card.",
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
  ],
});
