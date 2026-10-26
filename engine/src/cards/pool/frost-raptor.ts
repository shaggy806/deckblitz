import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 21439.

export default defineCard({
  name: "Frost Raptor",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{S}{S}: This creature gains shroud until end of turn. ({S} can be paid with one mana from a snow source. A creature with shroud can't be the target of spells or abilities.)",
  activated: [
    {
      cost: { mana: "{S}{S}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: "{S}{S}: This creature gains shroud until end of turn.",
    },
  ],
});
