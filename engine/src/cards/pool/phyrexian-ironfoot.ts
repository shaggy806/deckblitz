import { defineCard } from "../define.js";

// EDHREC rank 25360. Coldsnap.

export default defineCard({
  name: "Phyrexian Ironfoot",
  manaCost: "{3}",
  colors: [],
  supertypes: ["snow"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 3,
  toughness: 4,
  text: "This creature doesn't untap during your untap step.\n{1}{S}: Untap this creature. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "{1}{S}: Untap this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
});
