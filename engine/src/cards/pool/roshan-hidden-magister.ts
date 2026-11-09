import { defineCard } from "../define.js";

const TYPE_TEXT =
  "Other creatures you control are Assassins in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";
const MENACE_TEXT = "Face-down creatures you control have menace.";
const FACE_UP_TEXT = "Whenever a permanent you control is turned face up, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Roshan, Hidden Magister",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 4,
  text: `${TYPE_TEXT}\n${MENACE_TEXT}\n${FACE_UP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      addSubtypes: ["Assassin"],
      outsideBattlefield: { ofType: ["creature"], addSubtypes: ["Assassin"] },
      text: TYPE_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", faceDown: true } },
      grantKeywords: ["menace"],
      text: MENACE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
