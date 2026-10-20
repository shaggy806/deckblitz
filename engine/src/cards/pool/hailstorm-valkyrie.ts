import { defineCard } from "../define.js";

// EDHREC rank 17633.
const TEXT = "{S}{S}: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Hailstorm Valkyrie",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Angel", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TEXT} ({S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: "{S}{S}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
