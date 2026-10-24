import { defineCard } from "../define.js";

// EDHREC rank 12576.
const PING = "{T}: This creature deals 1 damage to each opponent.";
const UNTAP = "Whenever you cast a colorless spell, untap this creature.";

export default defineCard({
  name: "Nettle Drone",
  manaCost: "{2}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 1,
  text: `Devoid (This card has no color.)\n${PING}\n${UNTAP}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: PING,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colorless: true } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP,
    },
  ],
});
