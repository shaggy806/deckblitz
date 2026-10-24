import { defineCard } from "../define.js";

const MEGAMORPH_TEXT =
  "Megamorph {5}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)";
const FACE_UP_TEXT =
  "When this creature is turned face up, put a +1/+1 counter on each other Dragon creature you control.";

export default defineCard({
  name: "Stormwing Dragon",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "first-strike"],
  morph: { keyword: "megamorph", cost: "{5}{R}{R}" },
  text: `Flying, first strike\n${MEGAMORPH_TEXT}\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", subtype: "Dragon", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
