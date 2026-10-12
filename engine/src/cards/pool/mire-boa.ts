import { defineCard } from "../define.js";

export default defineCard({
  name: "Mire Boa",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 1,
  keywords: ["swampwalk"],
  text: "Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n{G}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
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
