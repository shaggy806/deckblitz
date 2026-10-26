import { defineCard } from "../define.js";

const PING = "{2}{R}, {T}: This creature deals 2 damage to target creature.";
const CHANNEL = "Channel — {3}{R}, Discard this card: It deals 4 damage to target creature.";

export default defineCard({
  name: "Ghost-Lit Raider",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `${PING}\n${CHANNEL}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PING,
    },
    {
      cost: { mana: "{3}{R}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: CHANNEL,
    },
  ],
});
