import { defineCard } from "../define.js";

// EDHREC rank 9520. A results table (rule 706.3a).
export default defineCard({
  name: "Swarming Goblins",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 4,
  toughness: 3,
  text: "When this creature enters, roll a d20.\n1—9 | Create a 1/1 red Goblin creature token.\n10—19 | Create two of those tokens.\n20 | Create three of those tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "create-token", token: "Goblin Token", count: 1 } },
          { min: 10, max: 19, effect: { kind: "create-token", token: "Goblin Token", count: 2 } },
          { min: 20, effect: { kind: "create-token", token: "Goblin Token", count: 3 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, roll a d20.\n1—9 | Create a 1/1 red Goblin creature token.\n10—19 | Create two of those tokens.\n20 | Create three of those tokens.",
    },
  ],
});
