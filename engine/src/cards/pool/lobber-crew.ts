import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 12100.
//
// Rulings:
//   [2012-10-01] You'll untap Lobber Crew before that spell resolves.
//   [2012-10-01] The hybrid spells in the Return to Ravnica set are multicolored, even if you cast
//     them with one color of mana.

const UNTAP_TEXT = "Whenever you cast a multicolored spell, untap this creature.";

export default defineCard({
  name: "Lobber Crew",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n{T}: This creature deals 1 damage to each opponent.\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "{T}: This creature deals 1 damage to each opponent.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
