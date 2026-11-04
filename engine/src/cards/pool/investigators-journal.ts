import { defineCard } from "../define.js";

const ENTER_TEXT = "This artifact enters with a number of suspect counters on it equal to the greatest number of creatures a player controls.";
const REMOVE_TEXT = "{2}, {T}, Remove a suspect counter from this artifact: Draw a card.";
const SACRIFICE_TEXT = "{2}, Sacrifice this artifact: Draw a card.";

export default defineCard({
  name: "Investigator's Journal",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book", "Clue"],
  text: `${ENTER_TEXT}\n${REMOVE_TEXT}\n${SACRIFICE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "suspect",
          amount: { greatestAmongPlayers: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true } },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "suspect", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: REMOVE_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
