import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, that player puts a flood counter on target non-Island land they control of their choice. That land is an Island for as long as it has a flood counter on it.";
const END_TEXT =
  "At the beginning of each end step, if all lands on the battlefield are Islands, remove all flood counters from them.";

export default defineCard({
  name: "Quicksilver Fountain",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [
        {
          kind: "permanent",
          filter: { type: "land", notSubtypes: ["Island"], controlledBy: "active-player" },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "flood", amount: 1, by: "active-player" },
          { kind: "become", target: 0, setSubtypes: ["Island"], duration: { whileCounter: "flood" } },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "not",
        of: {
          kind: "controls",
          filter: { type: "land", notSubtypes: ["Island"] },
          atLeast: 1,
          anyController: true,
        },
      },
      targets: [],
      effect: { kind: "remove-counter-all", filter: { type: "land" }, counter: "flood", amount: "all" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
