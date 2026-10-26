import { defineCard } from "../define.js";

export default defineCard({
  name: "Gilt-Leaf Seer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{G}, {T}: Look at the top two cards of your library, then put them back in any order.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 2, min: 2, max: 2, destination: "library-top", leftover: "stay" },
      resolve: null,
      text: "{G}, {T}: Look at the top two cards of your library, then put them back in any order.",
    },
  ],
});
