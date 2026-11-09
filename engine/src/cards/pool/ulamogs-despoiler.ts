import { defineCard } from "../define.js";

const ENTER_TEXT =
  "As this creature enters, you may put two cards your opponents own from exile into their owners' graveyards. If you do, this creature enters with four +1/+1 counters on it.";

export default defineCard({
  name: "Ulamog's Despoiler",
  manaCost: "{6}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 5,
  toughness: 5,
  text: ENTER_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { putFromExile: 2 },
        counters: { kind: "+1/+1", amount: "done-as-enters", eachDone: 2 },
      },
      text: ENTER_TEXT,
    },
  ],
});
