import { defineCard } from "../define.js";

// EDHREC rank 20272.
//
// X is the X it was cast with (rule 107.3m), 0 if it entered without being
// cast — then no mode can be chosen. The modes are chosen as the trigger goes
// on the stack (rule 700.2b), each at most once, with their targets; with
// none chosen it's removed from the stack. The chosen ones happen in the
// order printed.
const COUNTERS_TEXT = "The Ruinous Wrecking Crew enters with X +1/+1 counters on it.";
const ENTER_TEXT = "When The Ruinous Wrecking Crew enters, choose up to X —";
const LOOT_MODE = "Discard a card, then draw a card.";
const DRAIN_MODE = "Target opponent loses 2 life.";
const DESTROY_MODE = "Destroy target token.";
const SACRIFICE_MODE = "Each player sacrifices a creature of their choice.";

export default defineCard({
  name: "The Ruinous Wrecking Crew",
  manaCost: "{X}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 2,
  text: `${COUNTERS_TEXT}\n${ENTER_TEXT}\n• ${LOOT_MODE}\n• ${DRAIN_MODE}\n• ${DESTROY_MODE}\n• ${SACRIFICE_MODE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: COUNTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: "x",
        modes: [
          {
            text: LOOT_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "you", amount: 1 },
                { kind: "draw", amount: 1 },
              ],
            },
          },
          { text: DRAIN_MODE, targets: ["opponent"], effect: { kind: "lose-life", amount: 2, target: 0 } },
          {
            text: DESTROY_MODE,
            targets: [{ kind: "permanent", filter: { token: true } }],
            effect: { kind: "destroy", target: 0 },
          },
          {
            text: SACRIFICE_MODE,
            effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
          },
        ],
      },
      resolve: null,
      text: `${ENTER_TEXT} ${LOOT_MODE} ${DRAIN_MODE} ${DESTROY_MODE} ${SACRIFICE_MODE}`,
    },
  ],
});
