import { defineCard } from "../define.js";

// EDHREC rank 17224.
//
// Rulings:
//   [2016-04-08] Most triggered delirium abilities use an intervening "if" clause. There must be
//     four or more card types among cards in your graveyard in order for these abilities to
//     trigger, otherwise they never trigger at all. The number of card types is checked again as
//     the trigger resolves, and if it has become too low somehow, the ability does nothing.

const TEXT =
  "Delirium — At the beginning of your upkeep, if there are four or more card types among cards in your graveyard, put three +1/+1 counters on this creature.";

export default defineCard({
  name: "Soul Swallower",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
