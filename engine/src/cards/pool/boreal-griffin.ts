import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 26210.

export default defineCard({
  name: "Boreal Griffin",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{S}: This creature gains first strike until end of turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{S}: This creature gains first strike until end of turn.",
    },
  ],
});
