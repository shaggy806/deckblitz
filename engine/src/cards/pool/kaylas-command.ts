import { defineCard } from "../define.js";

// EDHREC rank 14733.
//
// Rulings:
//   [2022-10-14] None of the modes have any targets. Notably, this means that you don't have to
//     choose a creature for the second mode until the spell resolves.
//
// So the second mode's creature is a `choose-permanents` as it resolves (Sword of Truth and
// Justice's shape), not a target.

const TOKEN_MODE = "Create a 2/2 colorless Construct artifact creature token.";
const COUNTER_MODE = "Put a +1/+1 counter on a creature you control. It gains double strike until end of turn.";
const PLAINS_MODE = "Search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.";
const LIFE_MODE = "You gain 2 life and scry 2.";

export default defineCard({
  name: "Kayla's Command",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Choose two —\n• ${TOKEN_MODE}\n• ${COUNTER_MODE}\n• ${PLAINS_MODE}\n• ${LIFE_MODE}`,
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        targets: [],
        text: TOKEN_MODE,
        effect: { kind: "create-token", token: "Construct Token (Kayla's Command)", count: 1 },
      },
      {
        targets: [],
        text: COUNTER_MODE,
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose a creature you control to put a +1/+1 counter on",
          then: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
            ],
          },
        },
      },
      {
        targets: [],
        text: PLAINS_MODE,
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", subtype: "Plains" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      {
        targets: [],
        text: LIFE_MODE,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: 2 },
            { kind: "scry", amount: 2 },
          ],
        },
      },
    ],
  },
});
