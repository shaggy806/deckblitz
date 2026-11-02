import { defineCard } from "../define.js";

const TRIGGER =
  "When this creature enters, each player sacrifices a creature or planeswalker of their choice. Each player who can't discards a card.";

// Who can't is found first: a player sacrificing their last one could. Those
// who can't choose their discards in turn, then discard at once (rule 101.4).
export default defineCard({
  name: "Plaguecrafter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 2,
  text: TRIGGER,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: {
            kind: "not",
            of: { kind: "controls", filter: { typesAnyOf: ["creature", "planeswalker"] }, atLeast: 1 },
          },
        },
        before: {
          kind: "sacrifice",
          who: "each-player",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
          count: 1,
        },
        choicesHeld: true,
        effect: { kind: "discard", target: "that-player", amount: 1 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
