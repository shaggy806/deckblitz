import { defineCard } from "../define.js";

// EDHREC rank 17034.
//
// Rulings:
//   [2023-06-16] To determine the amount of damage it deals, use Goblin Fireleaper's power as it
//     last existed on the battlefield, not its power in the graveyard.
//
// `powerOf: "source"` in a dies trigger reads the power it died with.

const PUMP_TEXT = "{1}{R}: This creature gets +1/+0 until end of turn.";
const DIES_TEXT = "When this creature dies, it deals damage equal to its power to target creature an opponent controls.";

export default defineCard({
  name: "Goblin Fireleaper",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${PUMP_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
