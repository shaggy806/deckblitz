import { defineCard } from "../define.js";

// Murders at Karlov Manor Commander. EDHREC rank 11084.
//
// "Cards in your graveyard you've surveilled this turn" are those its owner
// put there by surveilling this turn (rule 701.25a) and still there, the
// same objects (400.7): a card seen while surveilling, left on top and put
// into the graveyard later by other means isn't one (the ruling) — the
// journal's `surveilled` word. A land comes out with a land play; a spell
// keeps its timing and is cast for life equal to its mana value rather than
// its mana cost — an alternative cost (rule 118.9), so no other one goes
// with it, though additional costs still do, and X is 0 (107.3b; the
// rulings), as Bolas's Citadel's.
const PLAY_TEXT =
  "You may play lands and cast spells from among cards in your graveyard you've surveilled this turn. If you cast a spell this way, you pay life equal to its mana value rather than paying its mana cost.";

export default defineCard({
  name: "Eye of Duskmantle",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Eye"],
  power: 3,
  toughness: 8,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${PLAY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        play: true,
        filter: { journaled: { what: "surveilled", by: "you" } },
        byPayingLife: true,
      },
      text: PLAY_TEXT,
    },
  ],
});
