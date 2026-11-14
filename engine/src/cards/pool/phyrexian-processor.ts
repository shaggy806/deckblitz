import { defineCard } from "../define.js";

const PAY_TEXT = "As this artifact enters, pay any amount of life.";
const MAKE_TEXT =
  "{4}, {T}: Create an X/X black Phyrexian Minion creature token, where X is the life paid as this artifact entered.";

// The life is paid as it's about to enter (rule 614.1c), any amount from 0
// (its ruling) to its controller's life total (rule 119.4), and kept on it as
// the number noted. A copy entering pays its own; a token copy, never asked,
// paid 0.
export default defineCard({
  name: "Phyrexian Processor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${PAY_TEXT}\n${MAKE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", asEnters: { payLife: "any" } },
      text: PAY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Phyrexian Minion Token (Black 0/0)",
        count: 1,
        basePt: { power: { chosenNumber: true }, toughness: { chosenNumber: true } },
      },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
