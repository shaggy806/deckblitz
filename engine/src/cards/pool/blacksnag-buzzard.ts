import { defineCard } from "../define.js";

// EDHREC rank 24573. Cackling Slasher's enters-with replacement: one counter
// if any creature (anyone's) died this turn, none otherwise.
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it if a creature died this turn.";

export default defineCard({
  name: "Blacksnag Buzzard",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  plot: { cost: "{1}{B}" },
  text: `Flying\n${ENTER_TEXT}\nPlot {1}{B} (You may pay {1}{B} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { ifCondition: { kind: "creature-died-this-turn" }, then: 1, else: 0 },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
