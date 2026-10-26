import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 29699.

const TEXT =
  "{2}{S}: Target snow creature gains first strike until end of turn. ({S} can be paid with one mana from a snow source.)";

export default defineCard({
  name: "Ohran Yeti",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{S}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", supertype: "snow" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
