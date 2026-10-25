import { defineCard } from "../define.js";

// EDHREC rank 13998.
//
// Rulings:
//   [2016-04-08] Most triggered delirium abilities use an intervening "if" clause. There must be
//     four or more card types among cards in your graveyard in order for these abilities to
//     trigger, otherwise they never trigger at all. The number of card types is checked again as
//     the trigger resolves, and if it has become too low somehow, the ability does nothing.
// "That player" is the opponent whose upkeep it is — the active player.

const ENTER_TEXT = "When this creature enters, it deals 1 damage to each opponent.";
const UPKEEP_TEXT =
  "Delirium — At the beginning of each opponent's upkeep, if there are four or more card types among cards in your graveyard, this creature deals 1 damage to that player.";

export default defineCard({
  name: "Gibbering Fiend",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "active-player" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
