import { defineCard } from "../define.js";

// EDHREC rank 7988. Final Fantasy.
//
// Rulings:
//   [2025-06-06] If Gau is no longer on the battlefield when its last ability resolves, use its
//     power as it last existed on the battlefield to determine how much damage the ability deals.
//   [2025-06-06] Gau's last ability checks at the moment it would trigger to see if a card left
//     your graveyard this turn. If none did, the ability won't trigger at all. Once your end step
//     begins, it's too late to make a card leave your graveyard in order to cause this ability to
//     trigger.
//
// Relic Retriever's intervening-if at each end step; `powerOf: "source"`
// reads Gau as it last existed if it has left (the ruling).
const RAGE_TEXT = "Rage — Whenever Gau attacks, put a +1/+1 counter on it.";
const END_TEXT =
  "At the beginning of each end step, if a card left your graveyard this turn, Gau deals damage equal to its power to each opponent.";

export default defineCard({
  name: "Gau, Feral Youth",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 2,
  text: `${RAGE_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: RAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "cards-left-graveyard", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "damage", amount: { powerOf: "source" }, who: "each-opponent" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
