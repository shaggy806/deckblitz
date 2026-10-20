import { defineCard } from "../define.js";

// EDHREC rank 9890.
const TEXT = "{S}{S}: This creature gets +2/+0 and gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Icehide Troll",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Troll", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (Damage and effects that say "destroy" don't destroy it. {S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: "{S}{S}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
