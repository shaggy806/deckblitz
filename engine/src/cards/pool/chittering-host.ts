import { defineCard } from "../define.js";

// The combined back face of Midnight Scavengers and Graf Rats (rule 712.5a):
// never a card of its own, only the face of the permanent they meld into
// (`meldOf`). Its mana value there is theirs summed, 7 (rule 712.8g).
//
// Rulings:
//   [2016-07-13] The set of creatures affected by Chittering Host's triggered ability is
//     determined as the ability resolves. Creatures you begin to control later in the turn won't
//     get +1/+0 or gain menace.
const ENTER_TEXT = "When this creature enters, other creatures you control get +1/+0 and gain menace until end of turn.";

export default defineCard({
  name: "Chittering Host",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Horror"],
  power: 5,
  toughness: 6,
  keywords: ["haste", "menace"],
  meldOf: ["Midnight Scavengers", "Graf Rats"],
  text: `Haste\nMenace (This creature can't be blocked except by two or more creatures.)\n${ENTER_TEXT}`,
  triggered: [
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
            toughness: 0,
            duration: "end-of-turn",
            exceptSource: true,
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "menace",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
