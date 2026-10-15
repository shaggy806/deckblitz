import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 9047.
const FIREBENDING_TEXT =
  "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)";

export default defineCard({
  name: "Fire Sages",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${FIREBENDING_TEXT}\n{1}{R}{R}: Put a +1/+1 counter on this creature.`,
  triggered: [firebending(1, FIREBENDING_TEXT)],
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}{R}{R}: Put a +1/+1 counter on this creature.",
    },
  ],
});
