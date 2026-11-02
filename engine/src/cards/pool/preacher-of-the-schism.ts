import { defineCard } from "../define.js";

const LIFELINK_TEXT = "Whenever this creature attacks the player with the most life or tied for most life, create a 1/1 white Vampire creature token with lifelink.";
const DRAW_TEXT = "Whenever this creature attacks while you have the most life or are tied for most life, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Preacher of the Schism",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${LIFELINK_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defenderLife: "most" },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Vampire Token", count: 1 },
      resolve: null,
      text: LIFELINK_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "player-compare", stat: "life", compare: "at-least", than: "each-opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
