import { defineCard } from "../define.js";

// EDHREC rank 6985. Teenage Mutant Ninja Turtles Commander.
//
// A draw of anyone's can double its own second ability, and any other trigger
// of yours a draw causes (`doubleTriggers`, cause "draws").
const DOUBLE_TEXT =
  "If a player drawing a card causes a triggered ability of a permanent you control to trigger, that ability triggers an additional time.";
const COUNTER_TEXT = "Whenever a player draws their second card each turn, put a +1/+1 counter on Krang.";

export default defineCard({
  name: "Krang, the All-Powerful",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  supertypes: ["legendary"],
  subtypes: ["Utrom", "Robot"],
  power: 3,
  toughness: 3,
  text: `${DOUBLE_TEXT}\n${COUNTER_TEXT}`,
  static: [{ affects: { scope: "self" }, doubleTriggers: { cause: "draws" }, text: DOUBLE_TEXT }],
  triggered: [
    {
      trigger: { on: "draws", who: "any", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
