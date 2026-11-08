import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 274.
//
// The top card is its controller's to look at any time (rule 401.5). A land
// comes off the top with a land play (the ruling); a spell keeps its timing
// (the ruling) and is cast for life equal to its mana value rather than its
// mana cost — an alternative cost (rule 118.9), so no other one goes with it,
// though additional costs and cost increases still do, and X is 0 (107.3b;
// the rulings). Another permission to cast it from the top (Future Sight)
// still lets it be paid for as usual. The Citadel may be one of the ten it
// sacrifices (the ruling).
const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT =
  "You may play lands and cast spells from the top of your library. If you cast a spell this way, pay life equal to its mana value rather than pay its mana cost.";
const DRAIN_TEXT = "{T}, Sacrifice ten nonland permanents: Each opponent loses 10 life.";

export default defineCard({
  name: "Bolas's Citadel",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${LOOK_TEXT}\n${PLAY_TEXT}\n${DRAIN_TEXT}`,
  looksAtOwnLibraryTop: true,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { notTypes: ["land"] }, count: 10 } },
      targets: [],
      effect: { kind: "lose-life", amount: 10, who: "each-opponent" },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", play: true, byPayingLife: true },
      text: PLAY_TEXT,
    },
  ],
});
