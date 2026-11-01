import { defineCard } from "../define.js";

// EDHREC rank 28979.

const LOOK_TEXT = "{2}: Until end of turn, you may look at face-down creatures you don't control any time.";

export default defineCard({
  name: "Lumbering Laundry",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 5,
  morph: { keyword: "disguise", cost: "{5}" },
  text: `${LOOK_TEXT}\nDisguise {5} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "grant-static",
        target: "source",
        ability: { affects: { scope: "self" }, visibility: { looksAtFaceDownCreatures: true }, text: "You may look at face-down creatures you don't control any time." },
        duration: "end-of-turn",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
