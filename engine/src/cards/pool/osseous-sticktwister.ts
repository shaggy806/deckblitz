import { defineCard } from "../define.js";

// Each opponent chooses in turn order, then all of them act at once (rule
// 101.4, its ruling); the damage is to each who did neither.
const DELIRIUM_TEXT =
  "Delirium — At the beginning of your end step, if there are four or more card types among cards in your graveyard, each opponent may sacrifice a nonland permanent of their choice or discard a card. Then this creature deals damage equal to its power to each opponent who didn't sacrifice a permanent or discard a card this way.";

export default defineCard({
  name: "Osseous Sticktwister",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${DELIRIUM_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "delirium" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          { sacrifice: { notTypes: ["land"] }, text: "Sacrifice a nonland permanent" },
          { discard: 1, text: "Discard a card" },
        ],
        ifDidnt: { kind: "damage", amount: { powerOf: "source" }, who: "that-player" },
      },
      resolve: null,
      text: DELIRIUM_TEXT,
    },
  ],
});
