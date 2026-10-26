import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 31631.
//
// Rulings:
//   [2004-10-04] You choose a land to return and return it during resolution of the upkeep
//     triggered ability. This means if you have two Waterspout Djinns, they must each return
//     different Islands.
//
// Living Tsunami's upkeep, narrowed to an untapped Island: with one you may
// return it, and the Djinn is sacrificed if you don't — or can't.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice this creature unless you return an untapped Island you control to its owner's hand.";
const ISLAND = { type: "land", subtype: "Island", tapped: false } as const;

export default defineCard({
  name: "Waterspout Djinn",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: ISLAND, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Return an untapped Island you control to its owner's hand? If you don't, sacrifice Waterspout Djinn.",
          effect: {
            kind: "choose-permanents",
            filter: { ...ISLAND, controlledBy: "you" },
            min: 1,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return an untapped Island you control to its owner's hand",
          },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
