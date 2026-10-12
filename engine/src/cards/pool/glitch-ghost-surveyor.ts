import { defineCard } from "../define.js";
import { MAX_SPEED_CONDITION, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 24798. Goblin Surveyor's graveyard ability (rule 702.178b).
const DRAW_TEXT = "{3}, Exile this card from your graveyard: Draw a card.";

export default defineCard({
  name: "Glitch Ghost Surveyor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "start-your-engines"],
  text: `Flying\n${START_YOUR_ENGINES_TEXT}\nMax speed — ${DRAW_TEXT}`,
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
