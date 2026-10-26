import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 20976.

export default defineCard({
  name: "Chilling Shade",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{S}: This creature gets +1/+1 until end of turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{S}: This creature gets +1/+1 until end of turn.",
    },
  ],
});
