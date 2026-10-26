import { defineCard } from "../define.js";

// EDHREC rank 22842. Coldsnap.

export default defineCard({
  name: "Adarkar Windform",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{1}{S}: Target creature loses flying until end of turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: ["creature"],
      effect: { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
      resolve: null,
      text: "{1}{S}: Target creature loses flying until end of turn.",
    },
  ],
});
