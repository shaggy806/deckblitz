import { defineCard } from "../define.js";

// EDHREC rank 28575.

const FACE_UP_TEXT =
  "When this creature is turned face up, target creature you control gains protection from the color of your choice until end of turn.";

export default defineCard({
  name: "Aven Liberator",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{3}{W}" },
  text: `Flying\nMorph {3}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
