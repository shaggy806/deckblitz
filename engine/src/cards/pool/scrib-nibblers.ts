import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 15458.
//
// Dimensional Infiltrator's shape: exile the top card, then gain the life
// only if the card exiled this way is a land card.
const EXILE_TEXT = "{T}: Exile the top card of target player's library. If it's a land card, you gain 1 life.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, you may untap this creature.";

export default defineCard({
  name: "Scrib Nibblers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: `${EXILE_TEXT}\n${LANDFALL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: 0, amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "land" }, atLeast: 1 },
            then: { kind: "gain-life", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Scrib Nibblers?",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
