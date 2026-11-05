import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, create a number of 1/1 white Rabbit creature tokens equal to the number of other creatures you control named Hare Apparent.";

export default defineCard({
  name: "Hare Apparent",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rabbit", "Noble"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\nA deck can have any number of cards named Hare Apparent.`,
  deckCopies: "any",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Rabbit Token",
        count: {
          countOf: { type: "creature", controlledBy: "you", name: "Hare Apparent" },
          excludeSelf: true,
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
