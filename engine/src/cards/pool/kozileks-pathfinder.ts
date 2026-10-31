import { defineCard } from "../define.js";

// "This creature" is the Pathfinder as the ability resolves: one that leaves
// and comes back is a new object the target may block (rule 400.7).
const EVADE = "{C}: Target creature can't block this creature this turn. ({C} represents colorless mana.)";

export default defineCard({
  name: "Kozilek's Pathfinder",
  manaCost: "{6}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 5,
  toughness: 5,
  text: EVADE,
  activated: [
    {
      cost: { mana: "{C}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [], cantBlockAttacker: "source" },
      resolve: null,
      text: EVADE,
    },
  ],
});
