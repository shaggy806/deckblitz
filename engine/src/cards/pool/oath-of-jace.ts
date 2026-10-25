import { defineCard } from "../define.js";

const ENTER_TEXT = "When Oath of Jace enters, draw three cards, then discard two cards.";
const UPKEEP_TEXT = "At the beginning of your upkeep, scry X, where X is the number of planeswalkers you control.";

const PLANESWALKERS_YOU_CONTROL = { type: "planeswalker", controlledBy: "you" } as const;

export default defineCard({
  name: "Oath of Jace",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // With no planeswalkers as it resolves you don't scry at all (the
      // ruling), so nothing that triggers on scrying sees a scry 0.
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: PLANESWALKERS_YOU_CONTROL, atLeast: 1 },
        then: { kind: "scry", amount: { countOf: PLANESWALKERS_YOU_CONTROL } },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
