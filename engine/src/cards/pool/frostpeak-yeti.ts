import { defineCard } from "../define.js";

// EDHREC rank 18848.
const TEXT = "{1}{S}: This creature can't be blocked this turn.";

export default defineCard({
  name: "Frostpeak Yeti",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 3,
  toughness: 3,
  text: `${TEXT} ({S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
