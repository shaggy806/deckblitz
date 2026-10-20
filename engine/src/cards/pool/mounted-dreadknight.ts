import { defineCard } from "../define.js";

const ENTERS_TEXT = "This creature enters with a +1/+1 counter on it if an opponent lost life this turn.";

export default defineCard({
  name: "Mounted Dreadknight",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTERS_TEXT,
    },
  ],
});
