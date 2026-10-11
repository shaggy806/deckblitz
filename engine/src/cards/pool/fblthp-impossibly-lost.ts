import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 17529.
//
// Rulings:
//   [2026-08-21] Since Fblthp's ability causes you to win the game while that ability is still
//     resolving, this happens before state-based actions would be checked and performed.
//     Drawing cards from an empty library at any other time while Fblthp is on the battlefield
//     will still cause you to lose the game.
//
// "One or more of your opponents are dealt combat damage" is a batched damage
// trigger, once per combat damage event (first-strike and regular damage are
// two, rule 510.4) whoever dealt it — Mindblade Render's shape. "During your
// turn" can't change before it resolves, so it is the intervening-if. The win
// is checked as the ability resolves (Jace, Wielder of Mysteries' shape),
// before the state-based check that would make an empty-library draw lose.

const TEXT =
  "When one or more of your opponents are dealt combat damage during your turn, draw two cards. If your library has no cards in it, you win the game. Fblthp's owner shuffles him into their library.";

export default defineCard({
  name: "Fblthp, Impossibly Lost",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 1,
  text: `${TEXT} (If you draw from an empty library this way, you still win the game.)`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "opponent", combat: true, once: "per-event" },
      condition: { kind: "your-turn" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "library-size", who: "you", atMost: 0 },
            then: { kind: "win-game" },
          },
          { kind: "shuffle-into-library", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
