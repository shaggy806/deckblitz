import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 29039.

const GRANTED = "{T}: This creature deals 1 damage to any target.";
const TEXT = `Enchanted creature has "${GRANTED}"`;
const BOUNCE = "{1}{U}: Return this Aura to its owner's hand.";

export default defineCard({
  name: "Hypervolt Grasp",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}\n${BOUNCE}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
