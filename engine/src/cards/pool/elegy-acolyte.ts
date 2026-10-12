import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 5181.
// Makes Robot → use "Robot Token".
const DAMAGE_TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, you draw a card and lose 1 life.";
const VOID_TEXT =
  "Void — At the beginning of your end step, if a nonland permanent left the battlefield this turn or a spell was warped this turn, create a 2/2 colorless Robot artifact creature token.";

export default defineCard({
  name: "Elegy Acolyte",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${DAMAGE_TEXT}\n${VOID_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: VOID_CONDITION,
      effect: { kind: "create-token", token: "Robot Token", count: 1 },
      resolve: null,
      text: VOID_TEXT,
    },
  ],
});
