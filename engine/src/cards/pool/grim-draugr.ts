import { defineCard } from "../define.js";

// EDHREC rank 20929.
const TEXT = "{1}{S}: This creature gets +1/+0 and gains menace until end of turn.";

export default defineCard({
  name: "Grim Draugr",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Zombie", "Berserker"],
  power: 3,
  toughness: 2,
  text: `${TEXT} (It can't be blocked except by two or more creatures. {S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
