import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 11575.

const FIREBENDING_TEXT = "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)";
const PING_TEXT = "{3}: This creature deals 1 damage to each opponent.";

export default defineCard({
  name: "Vindictive Warden",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${FIREBENDING_TEXT}\n${PING_TEXT}`,
  triggered: [firebending(1, FIREBENDING_TEXT)],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
