import { defineCard } from "../define.js";

const BONUS_TEXT = "This creature gets +3/+0 as long as an opponent has eight or more cards in their graveyard.";
const MILL_TEXT = "Whenever this creature attacks or blocks, each player mills a card.";
const MILL = { kind: "mill", target: "each-player", amount: 1 } as const;

export default defineCard({
  name: "Tenured Oilcaster",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 2,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${BONUS_TEXT}\n${MILL_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      grantPt: [3, 0],
      text: BONUS_TEXT,
    },
  ],
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MILL, resolve: null, text: MILL_TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: MILL, resolve: null, text: MILL_TEXT },
  ],
});
