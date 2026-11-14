import { defineCard } from "../define.js";

// EDHREC rank 31829.
//
// - Minion of the Wastes's "pay any amount of life" as it enters, capped
//   (`payLife: { atMost }`) by the white nontoken permanents its controller's
//   opponents control plus the white cards in their graveyards, counted as it's
//   about to enter (rule 614.12).
// - Its power and toughness are the life paid (the `"chosen-number"` count).
//   No creature type (the ruling).

const PAY_TEXT =
  "As this creature enters, pay any amount of life. The amount you pay can't be more than the total number of white nontoken permanents your opponents control plus the total number of white cards in their graveyards.";
const PT_TEXT = "Nameless Race's power and toughness are each equal to the life paid as it entered.";

export default defineCard({
  name: "Nameless Race",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PAY_TEXT}\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: {
          payLife: {
            atMost: {
              sum: [
                { countOf: { colors: ["W"], token: false, controlledBy: "opponent" } },
                { countInGraveyard: { colors: ["W"], ownedBy: "opponent" } },
              ],
            },
          },
        },
      },
      text: PAY_TEXT,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "chosen-number", plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
