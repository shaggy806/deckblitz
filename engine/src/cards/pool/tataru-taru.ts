import { defineCard } from "../define.js";

// EDHREC rank 1045.
//
// "If it isn't that player's turn" is an intervening if (rule 603.4) about the
// player who drew, not about you: in a game of three or more, an opponent
// drawing on another opponent's turn counts and one drawing on their own
// doesn't. A draw on their own turn doesn't use up the once a turn, since the
// ability never triggered.
const ENTER_TEXT = "When Tataru Taru enters, you draw a card and target opponent may draw a card.";
const SECRETARY_TEXT =
  "Scions' Secretary — Whenever an opponent draws a card, if it isn't that player's turn, create a tapped Treasure token. This ability triggers only once each turn.";

export default defineCard({
  name: "Tataru Taru",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Advisor"],
  power: 0,
  toughness: 3,
  text: `${ENTER_TEXT}\n${SECRETARY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "each-player-may",
            who: { controllerOfTarget: 0 },
            prompt: "Draw a card?",
            effect: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "draws", who: "opponent" },
      condition: {
        kind: "not",
        of: { kind: "of-player", player: "that-player", condition: { kind: "your-turn" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
      resolve: null,
      oncePerTurn: true,
      text: SECRETARY_TEXT,
    },
  ],
});
