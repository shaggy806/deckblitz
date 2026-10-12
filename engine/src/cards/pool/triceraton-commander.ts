import { defineCard } from "../define.js";

// EDHREC rank 14387.

const ENTER_TEXT = "When this creature enters, create X 2/2 white Dinosaur Soldier creature tokens.";
const ATTACK_TEXT =
  "Whenever this creature attacks, Dinosaurs you control other than this creature get +1/+1 and gain flying until end of turn.";

// X is the X it was cast with (one X, though {X}{X} pays it twice); 0 if it
// entered without being cast. The attack pump reaches the Dinosaurs there as
// it resolves (rule 611.2c), not ones that arrive later.
export default defineCard({
  name: "Triceraton Commander",
  manaCost: "{X}{X}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Soldier Token", count: "x" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { subtype: "Dinosaur", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
            exceptSource: true,
          },
          {
            kind: "grant-keyword-all",
            filter: { subtype: "Dinosaur", controlledBy: "you" },
            keyword: "flying",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
