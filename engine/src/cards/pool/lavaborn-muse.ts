import { defineCard } from "../define.js";

// Prophecy. An intervening-if (rule 603.4) on the player whose upkeep it is:
// asked as the upkeep begins and again as it resolves.

const TEXT =
  "At the beginning of each opponent's upkeep, if that player has two or fewer cards in hand, this creature deals 3 damage to that player.";

export default defineCard({
  name: "Lavaborn Muse",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 2 } },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
