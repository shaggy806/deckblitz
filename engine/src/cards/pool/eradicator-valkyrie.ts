import { defineCard } from "../define.js";

// Rulings:
//   Eradicator Valkyrie can't be the target of abilities whose source is a planeswalker an
//     opponent controls.
//   As the boast ability resolves, first the next opponent in turn order chooses a creature or
//     planeswalker they control ... Then all chosen creatures and planeswalkers are sacrificed at
//     the same time.

const BOAST =
  "Boast — {1}{B}, Sacrifice a creature: Each opponent sacrifices a creature or planeswalker. (Activate only if this creature attacked this turn and only once each turn.)";

export default defineCard({
  name: "Eradicator Valkyrie",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Angel", "Berserker"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink, hexproof from planeswalkers\n${BOAST}`,
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { types: ["planeswalker"] },
      text: "Hexproof from planeswalkers",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      boast: true,
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        count: 1,
      },
      resolve: null,
      text: BOAST,
    },
  ],
});
