import { defineCard } from "../define.js";

const TRIGGER =
  'Whenever this creature deals combat damage to a player, create that many 0/1 colorless Eldrazi Spawn creature tokens. They have "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Rapacious One",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      // The trigger value is the damage dealt (Old Gnawbone's "that many").
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: { triggerValue: true } },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
