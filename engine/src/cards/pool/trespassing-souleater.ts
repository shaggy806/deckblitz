import { defineCard } from "../define.js";

export default defineCard({
  name: "Trespassing Souleater",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 2,
  toughness: 2,
  text: "{U/P}: This creature can't be blocked this turn. ({U/P} can be paid with either {U} or 2 life.)",
  activated: [
    {
      cost: { mana: "{U/P}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{U/P}: This creature can't be blocked this turn.",
    },
  ],
});
