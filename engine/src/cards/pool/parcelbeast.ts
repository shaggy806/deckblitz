import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "{1}, {T}: Look at the top card of your library. If it's a land card, you may put it onto the battlefield. If you don't put the card onto the battlefield, put it into your hand.";

// A land may go to the hand instead, unrevealed (the rulings); this isn't
// playing a land, so it doesn't use a land drop.
export default defineCard({
  name: "Parcelbeast",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elemental", "Beast"],
  power: 2,
  toughness: 4,
  mutate: "{G}{U}",
  text: `Mutate {G}{U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "hand",
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
