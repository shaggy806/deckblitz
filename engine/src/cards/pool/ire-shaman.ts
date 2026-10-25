import { defineCard } from "../define.js";

const MEGAMORPH_TEXT =
  "Megamorph {R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)";
const FACE_UP_TEXT =
  "When this creature is turned face up, exile the top card of your library. Until end of turn, you may play that card.";

export default defineCard({
  name: "Ire Shaman",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  morph: { keyword: "megamorph", cost: "{R}" },
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${MEGAMORPH_TEXT}\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
