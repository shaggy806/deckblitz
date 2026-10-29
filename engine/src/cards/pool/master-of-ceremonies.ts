import { defineCard } from "../define.js";

// EDHREC rank 3115.

export default defineCard({
  name: "Master of Ceremonies",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Druid"],
  power: 3,
  toughness: 4,
  text: "At the beginning of your upkeep, each opponent chooses money, friends, or secrets. For each player who chose money, you and that player each create a Treasure token. For each player who chose friends, you and that player each create a 1/1 green and white Citizen creature token. For each player who chose secrets, you and that player each draw a card.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", choose: true, who: "each-opponent", for: { options: ["money", "friends", "secrets"] } },
          {
            kind: "for-each-vote",
            option: 0,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Treasure Token", count: 1 },
                { kind: "create-token", token: "Treasure Token", count: 1, who: "that-player" },
              ],
            },
          },
          {
            kind: "for-each-vote",
            option: 1,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Citizen Token", count: 1 },
                { kind: "create-token", token: "Citizen Token", count: 1, who: "that-player" },
              ],
            },
          },
          {
            kind: "for-each-vote",
            option: 2,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "draw", amount: 1, who: "that-player" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, each opponent chooses money, friends, or secrets. For each player who chose money, you and that player each create a Treasure token. For each player who chose friends, you and that player each create a 1/1 green and white Citizen creature token. For each player who chose secrets, you and that player each draw a card.",
    },
  ],
});
