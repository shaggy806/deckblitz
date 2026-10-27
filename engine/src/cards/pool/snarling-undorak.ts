import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 31094.

const PUMP_TEXT = "{2}{G}: Target Beast creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Snarling Undorak",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  morph: { keyword: "morph", cost: "{1}{G}{G}" },
  text: `${PUMP_TEXT}\nMorph {1}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Beast" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
