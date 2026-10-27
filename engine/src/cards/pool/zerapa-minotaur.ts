import { defineCard } from "../define.js";

// EDHREC rank 31599. "Any player may activate this ability": `anyPlayer`.

const TEXT = "{2}: This creature loses first strike until end of turn. Any player may activate this ability.";

export default defineCard({
  name: "Zerapa Minotaur",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["first-strike"], duration: "end-of-turn" },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
