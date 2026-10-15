import { defineCard } from "../define.js";

// EDHREC rank 20078.
//
// The base P/T set is layer 7b (`animate` with no types added), so counters
// and pumps still apply on top of the 6/6.
const DRAW_TEXT =
  "Whenever you draw your second card each turn, until end of turn, Moon Girl and Devil Dinosaur's base power and toughness become 6/6 and they gain trample.";
const ARTIFACT_TEXT = "Whenever an artifact you control enters, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Moon Girl and Devil Dinosaur",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Dinosaur", "Hero"],
  power: 2,
  toughness: 2,
  text: `${DRAW_TEXT}\n${ARTIFACT_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 6,
            toughness: 6,
            addTypes: [],
            addSubtypes: [],
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ARTIFACT_TEXT,
      oncePerTurn: true,
    },
  ],
});
