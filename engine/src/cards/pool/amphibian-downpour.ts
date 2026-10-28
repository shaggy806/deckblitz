import { defineCard } from "../define.js";

// EDHREC rank 1231.
//
// "Is a blue Frog creature" with no "in addition" replaces its card types,
// creature types and colours (rule 205.1a — it keeps its supertypes, the
// ruling); the loss is a `loseAllAbilities` static, Frogify's. Storm copies of
// the Aura spell become token Auras as they resolve (rule 707.10f).
//
// Rulings:
//   [2024-06-07] Amphibian Downpour may enchant a permanent that is only temporarily a creature,
//     such as a Vehicle. If this happens, Amphibian Downpour's effect causes the enchanted
//     permanent to remain a 1/1 blue Frog creature even after the temporary effect making it a
//     creature expires.
//   [2024-06-07] The copies are put directly onto the stack. They aren't cast and won't be counted
//     by other spells with storm cast later in the turn.
//   [2024-06-07] Amphibian Downpour overwrites all colors and creature types the enchanted creature
//     has. It's just a blue Frog. The creature keeps any supertypes it has (such as legendary) but
//     loses any other card types it has (such as artifact).
//   [2024-06-07] If the enchanted creature gains an ability after Amphibian Downpour becomes
//     attached to it, it will keep that ability.

const FROG_TEXT =
  "Enchanted creature loses all abilities and is a blue Frog creature with base power and toughness 1/1.";

export default defineCard({
  name: "Amphibian Downpour",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies. Copies become tokens.)\nEnchant creature\n${FROG_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["creature"],
      setSubtypes: ["Frog"],
      setColors: ["U"],
      setBasePt: { power: 1, toughness: 1 },
      loseAllAbilities: true,
      text: FROG_TEXT,
    },
  ],
});
