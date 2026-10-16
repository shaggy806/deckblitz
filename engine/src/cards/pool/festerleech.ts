import { defineCard } from "../define.js";

// EDHREC rank 20324.

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, you mill two cards.";
const PUMP_TEXT = "{1}{B}: This creature gets +2/+2 until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Festerleech",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Leech"],
  power: 1,
  toughness: 1,
  text: `${DAMAGE_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
      oncePerTurn: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
