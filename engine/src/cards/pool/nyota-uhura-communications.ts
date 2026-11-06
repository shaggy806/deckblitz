import { defineCard } from "../define.js";

// EDHREC rank 28843.
// The number is the "as this enters" word (`chooseOnEnter`, "0" to "10"),
// read back as a number by the trigger's filter (the `chosenNumber` amount),
// as Talion, the Kindly Lord does.

const CHOOSE_TEXT = "Hailing Frequencies — As Nyota Uhura enters, choose a number between 0 and 10.";
const CAST_TEXT =
  "Open a Channel — Whenever an opponent casts a spell with mana value equal to the chosen number, you draw a card.";

export default defineCard({
  name: "Nyota Uhura, Communications",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 4,
  text: `${CHOOSE_TEXT}\n${CAST_TEXT}`,
  chooseOnEnter: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "opponent",
        filter: { manaValue: { op: "eq", n: { amount: { chosenNumber: true } } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
