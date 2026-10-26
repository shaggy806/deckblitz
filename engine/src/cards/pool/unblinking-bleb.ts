import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 19252.
//
// "This creature or another permanent" is any permanent (`who: "any"`): the
// Bleb has its abilities once it's face up, so its own turning triggers it.

const TEXT = "Whenever this creature or another permanent is turned face up, you may scry 2.";

export default defineCard({
  name: "Unblinking Bleb",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 3,
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: `Morph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT} (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "any" },
      targets: [],
      effect: { kind: "may", prompt: "Scry 2?", effect: { kind: "scry", amount: 2 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
