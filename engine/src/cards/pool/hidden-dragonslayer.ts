import { defineCard } from "../define.js";

const UP_TEXT =
  "When this creature is turned face up, destroy target creature with power 4 or greater an opponent controls.";

export default defineCard({
  name: "Hidden Dragonslayer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  morph: { keyword: "megamorph", cost: "{2}{W}" },
  text: `Lifelink\nMegamorph {2}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [
        { kind: "permanent", whose: "opponent", filter: { type: "creature", power: { op: "gte", n: 4 } } },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
