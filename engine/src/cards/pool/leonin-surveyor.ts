import { defineCard } from "../define.js";
import { MAX_SPEED_CONDITION, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 18969. Goblin Surveyor's graveyard ability (rule 702.178b).
const FIRST_STRIKE_TEXT = "During your turn, this creature has first strike.";
const DRAW_TEXT = "{3}, Exile this card from your graveyard: Draw a card.";

export default defineCard({
  name: "Leonin Surveyor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${FIRST_STRIKE_TEXT}\nMax speed — ${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: FIRST_STRIKE_TEXT,
    },
  ],
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
