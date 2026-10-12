import { defineCard } from "../define.js";

// EDHREC rank 8114. A preparation card (rule 722): its prepare spell is
// Wheel of Fortune, the pool's own card. "If a player has one or fewer cards
// in hand" — some player still in the game, you included — is an
// intervening if (rule 603.4), checked as it would trigger and again as it
// resolves (the ruling): not every player holding two or more.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if a player has one or fewer cards in hand, this creature becomes prepared.";

export default defineCard({
  name: "Naktamun Lorespinner",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal", "Wizard"],
  power: 3,
  toughness: 3,
  prepareSpell: "Wheel of Fortune",
  text: `${UPKEEP_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "not", of: { kind: "hand-size", who: "each-player", atLeast: 2 } },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
