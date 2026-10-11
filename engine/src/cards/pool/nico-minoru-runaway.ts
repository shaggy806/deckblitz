import { defineCard } from "../define.js";

// EDHREC rank 11977. Marvel Super Heroes Commander.
//
// Vega, the Watcher's "from anywhere other than your hand" trigger, and
// Breaching Dragonstorm's reveal-until: every card exiled this way stays in
// exile (`rest: "stay"`), the nonland card included unless it's cast.
const CAST_TEXT =
  "Whenever you cast a spell from anywhere other than your hand, Nico Minoru deals 2 damage to each opponent.";
const EXILE_TEXT =
  "{2}{R}, {T}, Discard a card: Exile cards from the top of your library until you exile a nonland card. You may cast that card without paying its mana cost.";

export default defineCard({
  name: "Nico Minoru, Runaway",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock", "Hero"],
  power: 2,
  toughness: 4,
  text: `${CAST_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
