import { defineCard } from "../define.js";

// Dissension (DIS). EDHREC rank 16891.
//
// Demons, Rakdos included, are neither counted nor sacrificed (the rulings):
// half the rest, rounded up. The combat-damage half counts the damaged
// player's own non-Demon permanents (`forEachPlayer`).
const NON_DEMON = { notSubtypes: ["Demon"] } as const;

export default defineCard({
  name: "Rakdos the Defiler",
  manaCost: "{2}{B}{B}{R}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nWhenever Rakdos attacks, sacrifice half the non-Demon permanents you control, rounded up.\nWhenever Rakdos deals combat damage to a player, that player sacrifices half the non-Demon permanents they control of their choice, rounded up.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "you",
        filter: NON_DEMON,
        count: { half: { countOf: { ...NON_DEMON, controlledBy: "you" } }, round: "up" },
      },
      resolve: null,
      text: "Whenever Rakdos attacks, sacrifice half the non-Demon permanents you control, rounded up.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "trigger-player",
        filter: NON_DEMON,
        count: { half: { countOf: { ...NON_DEMON, controlledBy: "you" }, forEachPlayer: true }, round: "up" },
      },
      resolve: null,
      text: "Whenever Rakdos deals combat damage to a player, that player sacrifices half the non-Demon permanents they control of their choice, rounded up.",
    },
  ],
});
