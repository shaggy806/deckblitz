import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 23731.
//
// Echo is Liberty Prime's "sacrifice it unless you pay" shape — a `may` with
// the cost {0}, `else` the sacrifice — so paying it can fire "when this
// creature's echo cost is paid": a triggered ability that triggers during the
// echo trigger's resolution and goes on the stack after it (rule 603.3), a
// `reflexive-trigger`. Each opponent, in turn order, may draw: if they do,
// they pick three, two or one (with declining, "up to three" — the ruling).
//
// Rulings:
//   [2007-05-01] When the echo ability resolves, you may pay {0} or choose not pay. The first
//     option means Shah of Naar Isle stays on the battlefield and its last ability triggers. The
//     second option means Shah of Naar Isle is sacrificed.
//   [2007-05-01] If you have multiple opponents, each one in turn order chooses whether or not to
//     draw cards, and if so, how many to draw (from zero to three).

const ECHO_TEXT =
  "Echo {0} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)";
const PAID_TEXT = "When this creature's echo cost is paid, each opponent may draw up to three cards.";

export default defineCard({
  name: "Shah of Naar Isle",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ECHO_TEXT}\n${PAID_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay echo {0} to keep Shah of Naar Isle? (Otherwise it's sacrificed.)",
        cost: "{0}",
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "each-player-may",
            who: "each-opponent",
            prompt: "Draw up to three cards?",
            effect: {
              kind: "modal",
              minModes: 1,
              maxModes: 1,
              modes: [
                { text: "Draw three cards.", effect: { kind: "draw", amount: 3 } },
                { text: "Draw two cards.", effect: { kind: "draw", amount: 2 } },
                { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
              ],
            },
          },
          text: PAID_TEXT,
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ECHO_TEXT,
    },
  ],
});
