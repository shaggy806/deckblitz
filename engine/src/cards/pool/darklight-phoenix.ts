import { defineCard } from "../define.js";

// EDHREC rank 22744.
//
// The return moves its own card out of the graveyard, so the ability works
// only there (rule 113.6k — `fromGraveyard`, Bloodghast's shape), and it's
// mandatory. "If two or more creatures died this turn" is an intervening if
// (rule 603.4), checked as the step begins and again on resolution; any
// player's creatures count (Emeritus of Woe's condition).
const RETURN_TEXT =
  "At the beginning of combat on your turn, if two or more creatures died this turn, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Darklight Phoenix",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${RETURN_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "turn-history", what: "died", who: "any-player", filter: { type: "creature" }, atLeast: 2 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
