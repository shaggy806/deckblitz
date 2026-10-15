import { defineCard } from "../define.js";

// EDHREC rank 17071.
//
// Terror Tide's count of permanent cards in your graveyard, read once as the
// ability resolves (the ruling). "Particle Beam" is an ability word.
//
// Rulings:
//   [2025-06-06] The value of X is calculated only once, as Cloud of Darkness's last ability
//     resolves.

const BEAM_TEXT =
  "Particle Beam — When Cloud of Darkness enters, target creature an opponent controls gets -X/-X until end of turn, where X is the number of permanent cards in your graveyard.";

const MINUS_X = {
  product: [
    {
      countInGraveyard: {
        typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
        ownedBy: "you",
      },
    },
    -1,
  ],
} as const;

export default defineCard({
  name: "Cloud of Darkness",
  manaCost: "{2}{B}{G}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${BEAM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
      resolve: null,
      text: BEAM_TEXT,
    },
  ],
});
