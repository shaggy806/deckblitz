import { defineCard } from "../define.js";

// EDHREC rank 4085.
//
// Soulstone Sanctuary's "all creature types", for a turn and paid in snow
// mana (rule 107.4h) — its own {C} included, it being a snow land.
const ANIMATE_TEXT =
  "{S}{S}{S}: This land becomes a 4/3 creature with vigilance and all creature types until end of turn. It's still a land.";

export default defineCard({
  name: "Faceless Haven",
  colors: [],
  supertypes: ["snow"],
  types: ["land"],
  text: `{T}: Add {C}.\n${ANIMATE_TEXT} ({S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{S}{S}{S}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["(every creature type)"],
        keywords: ["vigilance"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
