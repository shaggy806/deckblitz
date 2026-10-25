import { defineCard } from "../define.js";

const FLIP =
  "{0}: Flip a coin. If you win the flip, this creature phases out. If you lose the flip, sacrifice this creature.";

export default defineCard({
  name: "Frenetic Efreet",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{0}: Flip a coin. If you win the flip, this creature phases out. If you lose the flip, sacrifice this creature. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: { kind: "phase-out", target: "source" },
        lost: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FLIP,
    },
  ],
});
