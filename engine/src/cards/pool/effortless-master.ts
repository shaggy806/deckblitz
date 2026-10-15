import { defineCard } from "../define.js";

// EDHREC rank 22454.
//
// Rulings:
//   [2025-04-04] Effortless Master’s last ability will count any spells you’ve cast this turn,
//     which includes Effortless Master itself if you cast it. It doesn’t matter if the other
//     spells resolved, didn’t resolve, were countered, or are still on the stack.
//
// An "enters with" replacement (rule 614.1c): the count is read as it enters,
// and it's every spell cast this turn, this one included (the ruling).

const MENACE_TEXT = "Menace (This creature can't be blocked except by two or more creatures.)";
const ENTERS_TEXT =
  "This creature enters with two +1/+1 counters on it if you've cast two or more spells this turn.";

export default defineCard({
  name: "Effortless Master",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Monk"],
  power: 4,
  toughness: 3,
  keywords: ["vigilance", "menace"],
  text: `Vigilance\n${MENACE_TEXT}\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { ifCondition: { kind: "cast-this-turn", who: "you", atLeast: 2 }, then: 2, else: 0 },
        },
      },
      text: ENTERS_TEXT,
    },
  ],
});
