import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 27324.
//
// Burning Anger's granted ability, aimed at an attacking or blocking creature:
// the enchanted creature is the source, and its power is read as it resolves.

const GRANTED = "{T}: This creature deals damage equal to its power to target attacking or blocking creature.";
const TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Sinstriker's Will",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["attacking-or-blocking-creature"],
          effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
