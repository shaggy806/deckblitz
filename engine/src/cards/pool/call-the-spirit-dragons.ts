import { defineCard } from "../define.js";

// EDHREC rank 4521.
//
// Rulings:
//   The last ability will only cause you to win the game if you put a +1/+1
//     counter on each of five different Dragons with it.
//   If you control a Dragon that is more than one color, you may put more than
//     one +1/+1 counter on it with the last ability.
//
// One Dragon chosen for each color in turn (`choose-for-each-slot`), then the
// counters all put on at once (rule 608.2f), a Dragon chosen twice getting two
// together. "Five Dragons" is the different permanents counters went on
// (`this-way` "counters-put").

const STATIC_TEXT = "Dragons you control have indestructible.";
const TRIGGER_TEXT =
  "At the beginning of your upkeep, for each color, put a +1/+1 counter on a Dragon you control of that color. If you put +1/+1 counters on five Dragons this way, you win the game.";

export default defineCard({
  name: "Call the Spirit Dragons",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["enchantment"],
  text: `${STATIC_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Dragon", controlledBy: "you" } },
      grantKeywords: ["indestructible"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-for-each-slot",
            slots: "colors",
            filter: { subtype: "Dragon", controlledBy: "you" },
            prompt: "Put a +1/+1 counter on a {slot} Dragon you control",
            each: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "counters-put", filter: { subtype: "Dragon" }, atLeast: 5 },
            then: { kind: "win-game" },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
