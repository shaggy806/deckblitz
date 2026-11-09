import { defineCard } from "../define.js";

const REPLACE_TEXT = "If you would roll one or more dice, instead roll that many dice plus one and ignore the lowest roll.";
const COUNTER_TEXT = "Whenever you roll one or more dice, put a +1/+1 counter on Wyll.";

export default defineCard({
  name: "Wyll, Blade of Frontiers",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 1,
  pairing: { kind: "choose-a-background" },
  text: `${REPLACE_TEXT}\n${COUNTER_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-roll-dice", who: "you", instead: { modify: { plus: 1 } }, ignoreLowest: true },
      text: REPLACE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "rolls-dice", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
