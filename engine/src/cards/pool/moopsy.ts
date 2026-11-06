import { defineCard } from "../define.js";


export default defineCard({
  name: "Moopsy",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch\n{2}: This creature gains reach until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "reach", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gains reach until end of turn.",
    },
  ],
});
