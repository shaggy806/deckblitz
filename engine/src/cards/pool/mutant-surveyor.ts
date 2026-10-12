import { defineCard } from "../define.js";
import { MAX_SPEED_CONDITION, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 23655. Goblin Surveyor's graveyard ability (rule 702.178b).
const PUMP_TEXT = "{2}: This creature gets +1/+1 until end of turn.";
const DRAW_TEXT = "{3}, Exile this card from your graveyard: Draw a card.";

export default defineCard({
  name: "Mutant Surveyor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Mutant", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${PUMP_TEXT}\nMax speed — ${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
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
