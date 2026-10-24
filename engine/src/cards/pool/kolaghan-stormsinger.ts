import { defineCard } from "../define.js";

const MEGAMORPH_TEXT =
  "Megamorph {R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)";
const FACE_UP_TEXT = "When this creature is turned face up, target creature gains haste until end of turn.";

export default defineCard({
  name: "Kolaghan Stormsinger",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  morph: { keyword: "megamorph", cost: "{R}" },
  text: `Haste\n${MEGAMORPH_TEXT}\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
