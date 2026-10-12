import { defineCard } from "../define.js";

// EDHREC rank 18046.

export default defineCard({
  name: "Ruthless Waterbender",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 1,
  toughness: 3,
  text: "Waterbend {2}: This creature gets +1/+1 until end of turn. Activate only during your turn. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false, waterbend: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Waterbend {2}: This creature gets +1/+1 until end of turn. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
});
