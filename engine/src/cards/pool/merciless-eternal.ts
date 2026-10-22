import { defineCard } from "../define.js";
import { afflict } from "../helpers.js";

// EDHREC rank 25707.

const PUMP = "{2}{B}, Discard a card: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Merciless Eternal",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 2,
  toughness: 2,
  text: `Afflict 2 (Whenever this creature becomes blocked, defending player loses 2 life.)\n${PUMP}`,
  triggered: [afflict(2)],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
});
