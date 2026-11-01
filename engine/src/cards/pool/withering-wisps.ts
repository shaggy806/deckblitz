import { defineCard } from "../define.js";

// EDHREC rank 21665.
//
// The limit is the number of snow Swamps its controller controls as it would
// be activated: activations already made this turn count against it, so
// losing a snow Swamp can leave none to spare (rule 602.5b). The end-step
// check is every end step's, and it asks again as the trigger resolves (an
// intervening "if", rule 603.4).
const END_TEXT = "At the beginning of the end step, if no creatures are on the battlefield, sacrifice this enchantment.";
const PING_TEXT =
  "{B}: This enchantment deals 1 damage to each creature and each player. Activate no more times each turn than the number of snow Swamps you control.";

export default defineCard({
  name: "Withering Wisps",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${END_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
          { kind: "not", of: { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 } },
        ],
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      timesEachTurn: { countOf: { subtype: "Swamp", supertype: "snow", controlledBy: "you" } },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
