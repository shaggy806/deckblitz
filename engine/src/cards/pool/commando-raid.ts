import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 27490.
//
// The granted trigger is Mordant Dragon's: "target creature that player
// controls" is `"creature-defending-player-controls"`, since the creature is
// still attacking the player it just damaged as the trigger is put on the
// stack. "Damage equal to its power" is read as it resolves (Cyclops
// Gladiator's `powerOf: "source"`).

const GRANTED =
  "When this creature deals combat damage to a player, you may have it deal damage equal to its power to target creature that player controls.";

export default defineCard({
  name: "Commando Raid",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Until end of turn, target creature you control gains "${GRANTED}"`,
  targets: ["creature-you-control"],
  effect: {
    kind: "grant-triggered",
    target: 0,
    duration: "end-of-turn",
    ability: {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: {
        kind: "may",
        prompt: "Have this creature deal damage equal to its power to the targeted creature?",
        effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      },
      resolve: null,
      text: GRANTED,
    },
  },
});
