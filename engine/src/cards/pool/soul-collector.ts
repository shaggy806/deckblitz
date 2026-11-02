import { defineCard } from "../define.js";

// Sengir Vampire's trigger. A token that dies this way is gone: nothing
// returns (rule 111.7).
const TEXT =
  "Whenever a creature dealt damage by this creature this turn dies, return that card to the battlefield under your control.";

export default defineCard({
  name: "Soul Collector",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{B}{B}{B}" },
  text: `Flying\n${TEXT}\nMorph {B}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
