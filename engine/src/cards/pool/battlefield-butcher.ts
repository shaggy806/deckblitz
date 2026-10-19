import { defineCard } from "../define.js";

// EDHREC rank 24347. Waterbending Scroll's self-reducing activation, counted
// over Karador's "creature card in your graveyard"; it reduces only the
// generic {5}, never below zero.
const TEXT =
  "{5}, {T}: Each opponent loses 2 life. This ability costs {1} less to activate for each creature card in your graveyard.";

export default defineCard({
  name: "Battlefield Butcher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-opponent" },
      costReduction: { reduceGeneric: { cardsInGraveyard: { type: "creature" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
