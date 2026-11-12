import { defineCard } from "../define.js";

// EDHREC rank 14096.

const DOUBLE_TEXT =
  "{3}{R}, {T}: If a source you control would deal damage to an opponent this turn, it deals double that damage to that player instead.";

export default defineCard({
  name: "Goblin Goliath",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Mutant"],
  power: 5,
  toughness: 4,
  text: `When this creature enters, create a number of 1/1 red Goblin creature tokens equal to the number of opponents you have.\n${DOUBLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: true },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: {
          event: "would-deal-damage",
          source: { controlledBy: "you" },
          to: "opponent",
          instead: { modify: { times: 2 } },
        },
      },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: "When this creature enters, create a number of 1/1 red Goblin creature tokens equal to the number of opponents you have.",
    },
  ],
});
