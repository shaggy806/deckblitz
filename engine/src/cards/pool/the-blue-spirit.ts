import { defineCard } from "../define.js";

const FLASH_TEXT = "You may cast the first creature spell you cast each turn as though it had flash.";
const DRAW_TEXT = "Whenever a nontoken creature you control enters during combat, draw a card.";

// A creature spell cast earlier this turn — before this arrived too — was
// the first, so it leaves nothing to grant. "During combat" is part of the
// trigger event (any step of the combat phase), not an intervening if.
export default defineCard({
  name: "The Blue Spirit",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Ally"],
  power: 2,
  toughness: 4,
  text: `${FLASH_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { type: "creature" },
      castAsThoughFlashFirstEachTurn: true,
      text: FLASH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false } },
      whileCondition: { kind: "turn-structure", duringCombat: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
