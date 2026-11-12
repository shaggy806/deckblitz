import { defineCard } from "../define.js";

// EDHREC rank 2542.
//
// Rulings: the last ability modifies the rules, so it covers planeswalkers
// that come under your control later in the turn too; each time it resolves
// adds another activation; the timing rules still apply. For the first
// ability, it doesn't matter whether the planeswalker is still there.
// The extra activation is a turn-long `player-effect`
// (`extraLoyaltyActivation`); "you didn't activate a loyalty ability of a
// planeswalker this turn" reads the journal (`loyalty-activated`).
const END_STEP =
  "At the beginning of your end step, if you didn't activate a loyalty ability of a planeswalker this turn, you lose 2 life.";
const VEIL =
  "{4}, {T}: For each planeswalker you control, you may activate one of its loyalty abilities once this turn as though none of its loyalty abilities have been activated this turn.";

export default defineCard({
  name: "The Chain Veil",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${END_STEP}\n${VEIL}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "not",
        of: { kind: "turn-history", what: "loyalty-activated", who: "you", filter: { type: "planeswalker" }, atLeast: 1 },
      },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "you" },
      resolve: null,
      text: END_STEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", extraLoyaltyActivation: true },
      resolve: null,
      text: VEIL,
    },
  ],
});
