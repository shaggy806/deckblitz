import { defineCard } from "../define.js";

// EDHREC rank 30534.

const TEXT =
  "Whenever this creature deals combat damage to a player, that player reveals the top two cards of their library. You choose one of those cards and put it into their graveyard.";

export default defineCard({
  name: "Balshan Beguiler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        from: "trigger-player",
        zone: "library",
        count: 2,
        reveal: true,
        min: 1,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
