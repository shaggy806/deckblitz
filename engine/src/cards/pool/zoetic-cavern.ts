import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 7838. A land with morph: played as a land, or cast face down as
// a 2/2 creature for {3} (rule 702.37c — face down it's no land, so 305.9
// doesn't stop the cast) and turned face up for {2} into the land.
export default defineCard({
  name: "Zoetic Cavern",
  types: ["land"],
  text: "{T}: Add {C}.\nMorph {2} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  morph: { keyword: "morph", cost: "{2}" },
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
});
