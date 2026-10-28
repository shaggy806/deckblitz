import { defineCard } from "../define.js";

// EDHREC rank 2817.
//
// Outpost Siege's shape: each ability is gated on the word chosen as this
// entered (a copy with no choice has neither — the ruling).
//
// Enclave: `attacks-player` fires once per player attacked and never for an
// attack on a planeswalker (rule 508.3a), so "attacks you" is the player
// only; its trigger value is how many creatures were declared attacking you,
// fixed as it triggers (the ruling: removing attackers doesn't lower it). The
// attacking player is the active player.

const BROTHERHOOD_TEXT =
  "Brotherhood — At the beginning of your upkeep, each opponent draws a card. You draw a card for each card drawn this way.";
const ENCLAVE_TEXT =
  "Enclave — Whenever a player attacks you with one or more creatures, that player gets twice that many rad counters.";

export default defineCard({
  name: "Struggle for Project Purity",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose Brotherhood or Enclave.\n• ${BROTHERHOOD_TEXT}\n• ${ENCLAVE_TEXT}`,
  chooseOnEnter: ["Brotherhood", "Enclave"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "chosen-on-enter", value: "Brotherhood" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, who: "each-opponent" },
          { kind: "draw", amount: { thisWay: "drawn", who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: BROTHERHOOD_TEXT,
    },
    {
      trigger: { on: "attacks-player", who: "any", defender: "you" },
      condition: { kind: "chosen-on-enter", value: "Enclave" },
      targets: [],
      effect: {
        kind: "add-player-counters",
        counter: "rad",
        amount: { product: [{ triggerValue: true }, 2] },
        who: "active-player",
      },
      resolve: null,
      text: ENCLAVE_TEXT,
    },
  ],
});
