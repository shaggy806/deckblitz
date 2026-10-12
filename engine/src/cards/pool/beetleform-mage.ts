import { defineCard } from "../define.js";

export default defineCard({
  name: "Beetleform Mage",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Insect", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{G}{U}: This creature gets +2/+2 and gains flying until end of turn. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
            toughness: 2,
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
      text: "{G}{U}: This creature gets +2/+2 and gains flying until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
