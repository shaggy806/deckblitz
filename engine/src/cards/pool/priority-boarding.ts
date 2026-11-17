import { defineCard } from "../define.js";

// EDHREC rank 11434.
//
// Rulings:
//   Once you choose to reveal the top card of your library during the
//   resolution of Priority Boarding's ability, that ability won't trigger
//   again that turn, no matter how many more dice you roll — even if the card
//   you reveal has a mana value too great to be exiled or you choose not to
//   exile it.
//   If you roll several dice at the same time, the ability triggers once for
//   each roll. You can choose which result you want to reveal a card for.
//
// "Whenever you roll a die" is `rolls-die`: one trigger a die, its value that
// die's result. The reveal is a `may` done once each turn (rule 603.2h, the
// `oncePerTurn` that stops the ability triggering again), and "whenever you
// reveal a card with mana value less than the result this way" a reflexive
// triggered ability (rule 603.12) about the revealed card: "it" is that card,
// exiled only while it's still that object in the library (rule 400.7).
const TEXT =
  "Whenever you roll a die, you may reveal the top card of your library. Do this only once each turn. " +
  "Whenever you reveal a card with mana value less than the result this way, you may exile it. " +
  "If you do, you may play it this turn.";
const REFLEXIVE_TEXT = "You may exile the revealed card. If you do, you may play it this turn.";

export default defineCard({
  name: "Priority Boarding",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "rolls-die", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal the top card of your library?",
        oncePerTurn: true,
        effect: {
          kind: "reveal-top",
          then: {
            kind: "conditional",
            condition: { kind: "amounts", left: { manaValueOf: 0 }, op: "lt", right: { triggerValue: true } },
            then: {
              kind: "reflexive-trigger",
              targets: [],
              about: 0,
              text: REFLEXIVE_TEXT,
              effect: {
                kind: "may",
                prompt: "Exile the revealed card? You may play it this turn.",
                effect: {
                  kind: "exile",
                  target: "trigger-object",
                  mayPlay: { duration: "end-of-turn", play: true },
                },
              },
            },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
