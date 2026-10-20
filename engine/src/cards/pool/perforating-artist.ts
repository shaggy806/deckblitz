import { defineCard } from "../define.js";

// Each opponent chooses in turn order, then all of them act at once (rule
// 101.4, its ruling): the `each-player-may` holds each choice until the last.
const RAID_TEXT =
  "Raid — At the beginning of your end step, if you attacked this turn, each opponent loses 3 life unless that player sacrifices a nonland permanent of their choice or discards a card.";

export default defineCard({
  name: "Perforating Artist",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 3,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${RAID_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          { sacrifice: { notTypes: ["land"] }, text: "Sacrifice a nonland permanent" },
          { discard: 1, text: "Discard a card" },
        ],
        ifDidnt: { kind: "lose-life", amount: 3, who: "that-player" },
      },
      resolve: null,
      text: RAID_TEXT,
    },
  ],
});
