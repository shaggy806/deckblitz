import { defineCard } from "../define.js";

const SIEGE_TEXT =
  "(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)";
const ENTER_TEXT =
  "When this Siege enters, each player mills three cards, then each opponent discards a card and you draw a card. (To mill three cards, a player puts the top three cards of their library into their graveyard.)";

export default defineCard({
  name: "Invasion of Amonkhet",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_TEXT}\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 3 },
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "defense", last: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "cast-now", from: "source-exiled-this-way", free: true, transformed: true },
        ],
      },
      resolve: null,
      text: "When the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost.",
    },
  ],
  faces: ["Invasion of Amonkhet", "Lazotep Convert"],
  transform: true,
});
