import { defineCard } from "../define.js";

// The most artifacts any one opponent controls, not their sum (its ruling),
// read as the cost is worked out; the Treasures count the damaged player's
// artifacts as the trigger resolves (its ruling).

const TREASURES =
  "Whenever this creature deals combat damage to a player, you create a Treasure token for each artifact that player controls.";

export default defineCard({
  name: "Cavern-Hoard Dragon",
  manaCost: "{7}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample", "haste"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { amongPlayers: "greatest", who: "each-opponent", of: { countOf: { type: "artifact", controlledBy: "you" }, forEachPlayer: true } },
  },
  text: `This spell costs {X} less to cast, where X is the greatest number of artifacts an opponent controls.\nFlying, trample, haste\n${TREASURES}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { countOf: { type: "artifact", controlledBy: "you" }, forPlayer: "trigger-player" },
      },
      resolve: null,
      text: TREASURES,
    },
  ],
});
