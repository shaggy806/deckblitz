import { defineCard } from "../define.js";

const DIES =
  "When this creature dies, each player may pay any amount of mana. Then each player creates a number of 1/1 green Squirrel creature tokens equal to the amount of mana they paid this way.";

// The active player pays first, then each other player in turn order, then
// all the Squirrels enter at the same time (the ruling).
export default defineCard({
  name: "Liege of the Hollows",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  text: DIES,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "players-pay-any-amount",
        resource: "mana",
        each: { kind: "create-token", token: "Squirrel Token", count: "x", who: "that-player" },
      },
      resolve: null,
      text: DIES,
    },
  ],
});
