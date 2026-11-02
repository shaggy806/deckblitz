import { defineCard } from "../define.js";

const EXILE_TEXT = "Tap two untapped creatures you control that share a creature type: Exile enchanted creature.";

// The two may be any creatures with a type in common, summoning sick or not,
// the enchanted one too if you control it.
export default defineCard({
  name: "Weight of Conscience",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack.\n${EXILE_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" }, shareCreatureType: true, includeSelf: true },
      },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack"],
      text: "Enchanted creature can't attack.",
    },
  ],
});
