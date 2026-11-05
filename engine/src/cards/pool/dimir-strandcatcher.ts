import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever you attack, surveil X, where X is the number of opponents being attacked.";
const END_TEXT =
  "At the beginning of each end step, if three or more cards were put into your graveyard from anywhere other than the battlefield this turn, draw a card.";

export default defineCard({
  name: "Dimir Strandcatcher",
  manaCost: "{2}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "surveil", amount: { opponentsAttacked: true } },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "to-graveyard", who: "you", notFrom: ["battlefield"], atLeast: 3 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
