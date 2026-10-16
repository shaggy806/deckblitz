import { defineCard } from "../define.js";

// EDHREC rank 22207. Played from exile with every normal cost and timing
// rule (the ruling): an impulse permission for this turn only.
const ENTER_TEXT =
  "When this creature enters, exile the top card of your library. Until end of turn, you may play that card.";

export default defineCard({
  name: "Irascible Wolverine",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolverine"],
  power: 3,
  toughness: 2,
  plot: { cost: "{2}{R}" },
  text: `${ENTER_TEXT}\nPlot {2}{R} (You may pay {2}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
