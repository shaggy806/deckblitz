import { defineCard } from "../define.js";

const FLASH_TEXT = "You may cast spells this turn as though they had flash.";

// A rule for its controller until this turn's cleanup (rule 514.2) — every
// spell they cast this turn, not only the next.
export default defineCard({
  name: "Borne Upon a Wind",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${FLASH_TEXT}\nDraw a card.`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "player-effect", duration: "end-of-turn", castAsThoughFlash: {} },
      { kind: "draw", amount: 1 },
    ],
  },
});
