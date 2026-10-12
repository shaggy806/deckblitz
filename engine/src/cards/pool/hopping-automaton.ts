import { defineCard } from "../define.js";

export default defineCard({
  name: "Hopping Automaton",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: "{0}: This creature gets -1/-1 and gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: -1,
            toughness: -1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "flying",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{0}: This creature gets -1/-1 and gains flying until end of turn.",
    },
  ],
});
