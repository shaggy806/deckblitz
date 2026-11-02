import { defineCard } from "../define.js";

const TRIGGER =
  "Whenever this creature deals combat damage to a player, untap each creature you control. After this phase, there is an additional combat phase.";
const RESTRICTION = "This creature can't attack a player it has already attacked this turn.";

// The player, not their planeswalkers: it may go on to attack one of those.
export default defineCard({
  name: "Port Razer",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 4,
  toughness: 4,
  text: `${TRIGGER}\n${RESTRICTION}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-attack-player-attacked-this-turn"], text: RESTRICTION }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
