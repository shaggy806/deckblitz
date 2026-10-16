import { defineCard } from "../define.js";

const ENTER_TEXT = "Whenever another creature you control enters, put X +1/+1 counters on it, where X is its power.";

// X is its power as the trigger resolves (the ruling).
export default defineCard({
  name: "Railway Brawler",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["reach", "trample"],
  plot: { cost: "{3}{G}" },
  text: `Reach, trample\n${ENTER_TEXT}\nPlot {3}{G} (You may pay {3}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "trigger-object",
        counter: "+1/+1",
        amount: { powerOf: "trigger-object" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
