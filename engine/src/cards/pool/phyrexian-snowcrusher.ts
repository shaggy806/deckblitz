import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 22977.

export default defineCard({
  name: "Phyrexian Snowcrusher",
  manaCost: "{6}",
  colors: [],
  supertypes: ["snow"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Juggernaut"],
  power: 6,
  toughness: 5,
  text: "This creature attacks each combat if able.\n{1}{S}: This creature gets +1/+0 until end of turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{S}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
