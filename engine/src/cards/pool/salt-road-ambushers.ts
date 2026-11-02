import { defineCard } from "../define.js";

const TEXT = "Whenever another permanent you control is turned face up, if it's a creature, put two +1/+1 counters on it.";

export default defineCard({
  name: "Salt Road Ambushers",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Warrior"],
  power: 3,
  toughness: 3,
  morph: { keyword: "megamorph", cost: "{3}{G}{G}" },
  text: `${TEXT}\nMegamorph {3}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control", filter: { isSource: false } },
      condition: { kind: "trigger-object", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
