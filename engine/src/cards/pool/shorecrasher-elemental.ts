import { defineCard } from "../define.js";

// Back face down it's a new object (rule 400.7), turned face up only by its
// megamorph cost (702.37e), which puts the +1/+1 counter on it.
const EXILE_TEXT = "{U}: Exile this creature, then return it to the battlefield face down under its owner's control.";
const PUMP_TEXT = "{1}: This creature gets +1/-1 or -1/+1 until end of turn.";

export default defineCard({
  name: "Shorecrasher Elemental",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  morph: { keyword: "megamorph", cost: "{4}{U}" },
  text: `${EXILE_TEXT}\n${PUMP_TEXT}\nMegamorph {4}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "flicker", target: "source", faceDown: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "+1/-1", effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" } },
          { text: "-1/+1", effect: { kind: "modify-pt", target: "source", power: -1, toughness: 1, duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
