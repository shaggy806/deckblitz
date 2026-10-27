import { defineCard } from "../define.js";

const FACE_UP_TEXT = "When this creature is turned face up, target creature gains trample until end of turn.";

export default defineCard({
  name: "Woodcloaker",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 3,
  toughness: 3,
  morph: { keyword: "morph", cost: "{2}{G}{G}" },
  text: `Morph {2}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
