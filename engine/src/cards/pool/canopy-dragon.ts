import { defineCard } from "../define.js";

export default defineCard({
  name: "Canopy Dragon",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\n{1}{G}: This creature gains flying and loses trample until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "lose-keywords", target: "source", keywords: ["trample"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{1}{G}: This creature gains flying and loses trample until end of turn.",
    },
  ],
});
