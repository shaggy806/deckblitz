import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 19017.
//
// Nivix Guildmage's copy, one ability per card type, each narrowed to mana
// value 2 or less (its chosen X counted — the third ruling).
//
// Rulings:
//   [2024-01-12] If a spell has {X} in its mana cost, include the value chosen for that X when
//     determining the mana value of that spell.
//   [2024-01-12] Izzet Guildmage's abilities can copy any instant or sorcery spell with an
//     appropriate mana value, not just one with targets.
//   [2024-01-12] The copy will have the same targets as the spell it's copying unless you choose
//     new ones.

const INSTANT = "{2}{U}: Copy target instant spell you control with mana value 2 or less. You may choose new targets for the copy.";
const SORCERY = "{2}{R}: Copy target sorcery spell you control with mana value 2 or less. You may choose new targets for the copy.";

export default defineCard({
  name: "Izzet Guildmage",
  manaCost: "{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `({U/R} can be paid with either {U} or {R}.)\n${INSTANT}\n${SORCERY}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "spell", whose: "you", filter: { type: "instant", manaValue: { op: "lte", n: 2 } } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: INSTANT,
    },
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [{ kind: "spell", whose: "you", filter: { type: "sorcery", manaValue: { op: "lte", n: 2 } } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: SORCERY,
    },
  ],
});
