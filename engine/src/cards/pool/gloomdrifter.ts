import { defineCard } from "../define.js";

const GRANTED_TEXT = "When this creature enters, nonblack creatures get -2/-2 until end of turn.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Gloomdrifter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Minion"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "modify-pt-all",
            filter: { type: "creature", notColors: ["B"] },
            power: -2,
            toughness: -2,
            duration: "end-of-turn",
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
