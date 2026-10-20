import { defineCard } from "../define.js";

// EDHREC rank 18461. A Lesson — an ordinary sorcery here.
const RETURN_TEXT =
  "Return target planeswalker card with mana value X or less from your graveyard to the battlefield.";
const REMOVE_TEXT = "Remove twice X loyalty counters from target planeswalker an opponent controls.";

export default defineCard({
  name: "Confront the Past",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: `Choose one —\n• ${RETURN_TEXT}\n• ${REMOVE_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: RETURN_TEXT,
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { type: "planeswalker", manaValue: { op: "lte", n: "x" } },
          },
        ],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        text: REMOVE_TEXT,
        targets: [{ kind: "permanent", whose: "opponent", filter: { type: "planeswalker" } }],
        effect: {
          kind: "remove-counter",
          target: 0,
          counter: "loyalty",
          amount: { product: ["x", 2] },
        },
      },
    ],
  },
});
