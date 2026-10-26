import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 25120.

export default defineCard({
  name: "Boreal Centaur",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 2,
  toughness: 2,
  text: "{S}: This creature gets +1/+1 until end of turn. Activate only once each turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      oncePerTurn: true,
      resolve: null,
      text: "{S}: This creature gets +1/+1 until end of turn. Activate only once each turn.",
    },
  ],
});
