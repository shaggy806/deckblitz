import { defineCard } from "../define.js";

export default defineCard({
  name: "Frostwalla",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 2,
  text: "{S}: This creature gets +2/+2 until end of turn. Activate only once each turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{S}: This creature gets +2/+2 until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
