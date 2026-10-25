import { defineCard } from "../define.js";

// EDHREC rank 24904.
//
// Rulings:
//   Because you consider only the characteristics of a double-faced card's front face while it's
//     not on the battlefield, the types of its back face won't be counted for delirium.
//   Most triggered delirium abilities use an intervening "if" clause: there must be four or more
//     card types among cards in your graveyard for the ability to trigger, and the number is
//     checked again as it resolves.
//
// Extricator of Sin's delirium intervening-if (rule 603.4), at the end step.

const DELIRIUM_TEXT =
  "Delirium — At the beginning of your end step, if there are four or more card types among cards in your graveyard, transform this enchantment.";

export default defineCard({
  name: "Autumnal Gloom",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `{B}: Mill a card.\n${DELIRIUM_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: "{B}: Mill a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: DELIRIUM_TEXT,
    },
  ],
  faces: ["Autumnal Gloom", "Ancient of the Equinox"],
  transform: true,
});
