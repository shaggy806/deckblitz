import { defineCard } from "../define.js";
import { MAX_SPEED_CONDITION, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 19105. The max speed ability works from the graveyard, so the
// max speed ability that grants it does too (rule 702.178b): its owner's
// speed, there.
const DRAW_TEXT = "{3}, Exile this card from your graveyard: Draw a card.";

export default defineCard({
  name: "Goblin Surveyor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 3,
  toughness: 2,
  keywords: ["trample", "start-your-engines"],
  text: `Trample\n${START_YOUR_ENGINES_TEXT}\nMax speed — ${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      zone: "graveyard",
      condition: MAX_SPEED_CONDITION,
      text: `Max speed — ${DRAW_TEXT}`,
    },
  ],
});
