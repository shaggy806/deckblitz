import { defineCard } from "../define.js";

// The intervening "if" (rule 603.4) asks who was the monarch as the turn
// began (`JournalTurn.began`), as it triggers and again as it resolves.
const ENTERS_TEXT = "When this creature enters, you become the monarch.";
const MONARCH_TEXT =
  "Whenever an opponent becomes the monarch, if you were the monarch as the turn began, " +
  "that player loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Knights of the Black Rose",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${MONARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "event", event: "becomes-monarch", who: "opponent" },
      condition: { kind: "turn-stat", stat: "monarch-as-turn-began", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: 2 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: MONARCH_TEXT,
    },
  ],
});
