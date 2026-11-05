import { defineCard } from "../define.js";

const HIT =
  "Whenever this creature deals combat damage to a player, roll a d20. Draw cards equal to the result. You have no maximum hand size for the rest of the game.";

export default defineCard({
  name: "Ancient Silver Dragon",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 8,
  toughness: 8,
  keywords: ["flying"],
  text: `Flying\n${HIT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "roll-dice", sides: 20, then: { kind: "draw", amount: { roll: "total" } } },
          { kind: "player-effect", duration: "rest-of-game", noMaxHandSize: "you" },
        ],
      },
      resolve: null,
      text: HIT,
    },
  ],
});
