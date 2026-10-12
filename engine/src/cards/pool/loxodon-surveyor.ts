import { defineCard } from "../define.js";
import { MAX_SPEED_CONDITION, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 24539. Goblin Surveyor's graveyard ability (rule 702.178b).
const DRAW_TEXT = "{3}, Exile this card from your graveyard: Draw a card.";

export default defineCard({
  name: "Loxodon Surveyor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\nMax speed — ${DRAW_TEXT}`,
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
