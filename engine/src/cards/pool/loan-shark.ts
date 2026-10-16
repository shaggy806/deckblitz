import { defineCard } from "../define.js";

// EDHREC rank 17961. An intervening "if" (rule 603.4) over every spell cast
// this turn, this one included and whether or not they resolved (the ruling).
const ENTER_TEXT = "When this creature enters, if you've cast two or more spells this turn, draw a card.";

export default defineCard({
  name: "Loan Shark",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shark", "Rogue"],
  power: 3,
  toughness: 4,
  plot: { cost: "{3}{U}" },
  text: `${ENTER_TEXT}\nPlot {3}{U} (You may pay {3}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
