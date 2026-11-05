import { defineCard } from "../define.js";

// The colour is the chosen player's to choose, as the mana is added: `as-player`
// makes them the one who adds it, and so the one asked.

const TEXT = "When this creature enters, choose a player. That player adds two mana of any one color they choose.";

export default defineCard({
  name: "Stadium Vendors",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        anyPlayer: true,
        then: {
          kind: "as-player",
          who: "that-player",
          effect: { kind: "add-mana", mana: "any-color", amount: 2 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
