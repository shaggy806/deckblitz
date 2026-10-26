import { defineCard } from "../define.js";

// EDHREC rank 20296. Coldsnap.

export default defineCard({
  name: "Rimebound Dead",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  text: "{S}: Regenerate this creature. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{S}: Regenerate this creature.",
    },
  ],
});
