import { defineCard } from "../define.js";

// EDHREC rank 18756.

const MANA_TEXT = "{T}: Add {U} for each card you've drawn this turn. Spend this mana only to cast noncreature spells.";
const POWER_UP_TEXT =
  "Power-up — {5}{U}{U}: Each player shuffles their hand and graveyard into their library, then draws seven cards. Put a +1/+1 counter on Immortus. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Immortus, Master of Eternity",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero", "Villain"],
  power: 2,
  toughness: 2,
  text: `${MANA_TEXT}\n${POWER_UP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: { turnStat: "cards-drawn" },
        spendOnly: { spell: { notTypes: ["creature"] }, text: "Spend this mana only to cast noncreature spells." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      targets: [],
      powerUp: true,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
          { kind: "draw", who: "each-player", amount: 7 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: POWER_UP_TEXT,
    },
  ],
});
