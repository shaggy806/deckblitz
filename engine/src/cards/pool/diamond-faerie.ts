import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 20408.

export default defineCard({
  name: "Diamond Faerie",
  manaCost: "{2}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{1}{S}: Snow creatures you control get +1/+1 until end of turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", supertype: "snow", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{S}: Snow creatures you control get +1/+1 until end of turn.",
    },
  ],
});
