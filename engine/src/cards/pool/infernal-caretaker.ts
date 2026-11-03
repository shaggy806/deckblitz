import { defineCard } from "../define.js";

const TURNED_TEXT = "When this creature is turned face up, return all Zombie cards from all graveyards to their owners' hands.";

export default defineCard({
  name: "Infernal Caretaker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{3}{B}" },
  text: `Morph {3}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TURNED_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        from: "all-graveyards",
        filter: { subtype: "Zombie" },
        destination: "hand",
        count: "all",
      },
      resolve: null,
      text: TURNED_TEXT,
    },
  ],
});
