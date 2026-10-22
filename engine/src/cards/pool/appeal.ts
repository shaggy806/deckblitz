import { defineCard } from "../define.js";

// The half of Appeal // Authority cast from the hand.
const FACES = ["Appeal // Authority", "Appeal", "Authority"];
const CREATURES_YOU_CONTROL = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Appeal",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Until end of turn, target creature gains trample and gets +X/+X, where X is the number of creatures you control.",
  targets: ["creature"],
  // X is counted once, as it resolves (the ruling).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: CREATURES_YOU_CONTROL, toughness: CREATURES_YOU_CONTROL, duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
