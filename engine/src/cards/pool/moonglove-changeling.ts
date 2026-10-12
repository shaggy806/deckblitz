import { defineCard } from "../define.js";

export default defineCard({
  name: "Moonglove Changeling",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\n{B}: This creature gains deathtouch until end of turn. (Any amount of damage it deals to a creature is enough to destroy that creature.)",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{B}: This creature gains deathtouch until end of turn.",
    },
  ],
});
