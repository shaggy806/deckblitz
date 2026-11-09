import { defineCard } from "../define.js";

const ENTER_TEXT = "When Marina Vendrell's Grimoire enters, if you cast it, draw five cards.";
const STATIC_TEXT = "You have no maximum hand size and don't lose the game for having 0 or less life.";
const GAIN_TEXT = "Whenever you gain life, draw that many cards.";
const LOSE_TEXT = "Whenever you lose life, discard that many cards. Then if you have no cards in hand, you lose the game.";

export default defineCard({
  name: "Marina Vendrell's Grimoire",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\n${GAIN_TEXT}\n${LOSE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      noMaxHandSize: true,
      prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castBy: "you" } },
      targets: [],
      effect: { kind: "draw", amount: 5 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: { triggerValue: true } },
      resolve: null,
      text: GAIN_TEXT,
    },
    {
      trigger: { on: "loses-life", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: { triggerValue: true } },
          { kind: "conditional", condition: { kind: "hand-size", atMost: 0 }, then: { kind: "lose-game" } },
        ],
      },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
});
