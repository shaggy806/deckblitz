import { defineCard } from "../define.js";

const FLASH_TEXT = "You may cast Spirit spells as though they had flash.";
const TAP_TEXT = "Whenever you cast a creature spell during an opponent's turn, tap up to one target creature.";

export default defineCard({
  name: "Breath of the Sleepless",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${FLASH_TEXT}\n${TAP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { subtype: "Spirit" },
      text: FLASH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      // Part of the trigger event ("during an opponent's turn"), not an
      // intervening "if": every other player is an opponent, so it's any
      // turn but yours.
      whileCondition: { kind: "not", of: { kind: "your-turn" } },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
