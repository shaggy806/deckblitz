import { defineCard } from "../define.js";

// The enters trigger exists only while threshold holds (see Cephalid Sage);
// it affects the creatures you control as it resolves (the ruling).

const ENTER_TEXT = "When this creature enters, creatures you control get +1/+1 and gain trample until end of turn.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature has "${ENTER_TEXT}"`;

export default defineCard({
  name: "Centaur Chieftain",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "modify-pt-all",
                filter: { type: "creature", controlledBy: "you" },
                power: 1,
                toughness: 1,
                duration: "end-of-turn",
              },
              {
                kind: "grant-keyword-all",
                filter: { type: "creature", controlledBy: "you" },
                keyword: "trample",
                duration: "end-of-turn",
              },
            ],
          },
          resolve: null,
          text: ENTER_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
