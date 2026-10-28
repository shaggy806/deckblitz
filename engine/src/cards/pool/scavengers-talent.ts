import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

const FOOD_TEXT =
  "Whenever one or more creatures you control die, create a Food token. This ability triggers only once each turn.";
const MILL_TEXT = "Whenever you sacrifice a permanent, target player mills two cards.";
const END_TEXT =
  "At the beginning of your end step, you may sacrifice three other nonland permanents. If you do, return a creature card from your graveyard to the battlefield with a finality counter on it.";

export default defineCard({
  name: "Scavenger's Talent",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${FOOD_TEXT}\n{1}{B}: Level 2\n${MILL_TEXT}\n{2}{B}: Level 3\n${END_TEXT}`,
  triggered: [
    {
      // Once each turn, so one trigger per creature is the batch's one.
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
    atLevel(2, {
      trigger: { on: "sacrifice", who: "you" },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: MILL_TEXT,
    }),
    atLevel(3, {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // "You may sacrifice three": not an option with fewer than three other
      // nonland permanents to sacrifice — then nothing is returned.
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { notTypes: ["land"] }, atLeast: 3, excludeSelf: true },
        then: {
          kind: "may",
          prompt: "Sacrifice three other nonland permanents to return a creature card with a finality counter?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "sacrifice", who: "you", filter: { notTypes: ["land"] }, count: 3, exceptSource: true },
              {
                kind: "return-from-graveyard",
                filter: { type: "creature" },
                destination: "battlefield",
                count: 1,
                withCounters: { kind: "finality", amount: 1 },
              },
            ],
          },
        },
      },
      resolve: null,
      text: END_TEXT,
    }),
  ],
  activated: [classLevel(2, "{1}{B}"), classLevel(3, "{2}{B}")],
});
