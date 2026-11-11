import { defineCard } from "../define.js";

// EDHREC rank 8249. "Another land" is a second land entering under that player
// this turn, the one that triggered it among them, so two entering at once each
// trigger it (the ruling); they return any land they control (the other ruling).
const ENTER_TEXT = "When this enchantment enters, draw a card.";
const LAND_TEXT =
  "Whenever a land an opponent controls enters, if that player had another land enter the battlefield under their control this turn, they return a land they control to its owner's hand.";

export default defineCard({
  name: "Confounding Conundrum",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "land", controlledBy: "opponent" } },
      condition: {
        kind: "of-player",
        player: "that-player",
        condition: { kind: "turn-history", what: "entered", who: "you", filter: { type: "land" }, atLeast: 2 },
      },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "trigger-controller",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a land you control to its owner's hand",
      },
      resolve: null,
      text: LAND_TEXT,
    },
  ],
});
