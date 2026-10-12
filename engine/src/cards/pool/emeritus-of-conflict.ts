import { defineCard } from "../define.js";

// EDHREC rank 7041. A preparation card (rule 722): its prepare spell is
// Lightning Bolt, the pool's own card. Your third spell this turn counts
// every spell you've cast, this one included and whether or not they
// resolved (the ruling); the trigger resolves before that spell. A copy of
// Lightning Bolt cast as your third spell unprepares it and then prepares
// it again (the ruling).
const CAST_TEXT = "Whenever you cast your third spell each turn, this creature becomes prepared.";

export default defineCard({
  name: "Emeritus of Conflict",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  prepareSpell: "Lightning Bolt",
  text: `First strike\n${CAST_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 3 },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
