import { defineCard } from "../define.js";

// EDHREC rank 17100.
//
// Rulings:
//   [2023-04-14] Unlike many similar abilities, Rampaging Raptor's triggered ability triggers
//     whenever it deals combat damage to an opponent, not to a player. If it happens to deal
//     combat damage to you (usually due to a redirection effect, which would be unusual), the
//     ability won't trigger.
//
// One slot over two kinds of permanent (`one-of`): a planeswalker that player
// controls, or a battle that player protects (rule 310.8) — whoever controls
// the battle (`protectedBy: "trigger-player"`).
const PUMP_TEXT = "{2}{R}: This creature gets +2/+0 until end of turn.";
const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to an opponent, it deals that much damage to target planeswalker that player controls or battle that player protects.";

export default defineCard({
  name: "Rampaging Raptor",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${PUMP_TEXT}\n${TRIGGER_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
      targets: [
        {
          kind: "one-of",
          of: [
            { kind: "permanent", whose: "trigger-player", filter: { type: "planeswalker" } },
            { kind: "permanent", protectedBy: "trigger-player", filter: { type: "battle" } },
          ],
        },
      ],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
