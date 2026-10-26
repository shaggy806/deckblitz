import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 28781.

export default defineCard({
  name: "Goblin Rimerunner",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: "{T}: Target creature can't block this turn.\n{S}: This creature gains haste until end of turn. ({S} can be paid with one mana from a snow source.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{T}: Target creature can't block this turn.",
    },
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{S}: This creature gains haste until end of turn.",
    },
  ],
});
