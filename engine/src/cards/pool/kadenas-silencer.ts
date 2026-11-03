import { defineCard } from "../define.js";

const UP_TEXT = "When this creature is turned face up, counter all abilities your opponents control.";

export default defineCard({
  name: "Kadena's Silencer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 2,
  toughness: 1,
  morph: { keyword: "megamorph", cost: "{1}{U}" },
  text: `${UP_TEXT}\nMegamorph {1}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "for-each-on-stack", abilities: true, whose: "opponent", effect: { kind: "counter", target: 0 } },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
