import { defineCard } from "../define.js";

const CAST_TEXT =
  "When you cast this spell, you may pay {1}{C}. If you do, target opponent sacrifices a creature. ({C} represents colorless mana.)";
const CANT_BLOCK_TEXT = "This creature can't block.";

export default defineCard({
  name: "Bearer of Silence",
  manaCost: "{1}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Devoid (This card has no color.)\n${CAST_TEXT}\nFlying\n${CANT_BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Pay {1}{C} to have that opponent sacrifice a creature?",
        cost: "{1}{C}",
        effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: CANT_BLOCK_TEXT,
    },
  ],
});
