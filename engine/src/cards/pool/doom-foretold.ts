import { defineCard } from "../define.js";

// EDHREC rank 15627.
//
// "That player" is the player whose upkeep it is (Bottomless Pit's
// `"active-player"`). "If that player can't" reads whether anything was
// sacrificed this way (Eldrazi Monument's shape): a player who controls a
// nonland, nontoken permanent must sacrifice one (the ruling), Doom Foretold
// itself included during your own upkeep. The consequences all happen even if
// the player has no card to discard, and the last step does nothing if Doom
// Foretold has already left (the rulings).

const TEXT =
  "At the beginning of each player's upkeep, that player sacrifices a nonland, nontoken permanent of their choice. If that player can't, they discard a card, they lose 2 life, you draw a card, you gain 2 life, you create a 2/2 white Knight creature token with vigilance, then you sacrifice this enchantment.";

export default defineCard({
  name: "Doom Foretold",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "active-player", filter: { notTypes: ["land"], token: false }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "active-player", amount: 1 },
                { kind: "lose-life", amount: 2, who: "active-player" },
                { kind: "draw", amount: 1 },
                { kind: "gain-life", amount: 2 },
                { kind: "create-token", token: "Knight Token", count: 1 },
                { kind: "sacrifice-source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
