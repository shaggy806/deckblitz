import { defineCard } from "../define.js";

const FACE_DOWN_YOURS = { type: "creature", controlledBy: "you", faceDown: true } as const;

export default defineCard({
  name: "Bustle",
  manaCost: "{4}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Creatures you control get +2/+2 and gain trample until end of turn. You may turn a creature you control face up.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
      {
        kind: "choose-permanents",
        filter: FACE_DOWN_YOURS,
        min: 0,
        upTo: 1,
        then: { kind: "turn-face-up", target: 0 },
        prompt: "You may turn a creature you control face up",
      },
    ],
  },
  faces: ["Hustle // Bustle", "Hustle", "Bustle"],
  split: true,
});
