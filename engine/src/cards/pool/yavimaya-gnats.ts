import { defineCard } from "../define.js";

export default defineCard({
  name: "Yavimaya Gnats",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
});
