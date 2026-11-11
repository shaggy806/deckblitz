import { defineCard } from "../define.js";

// EDHREC rank 4938.
//
// Rulings:
//   [2025-06-06] Wakka's last ability checks at the moment it would trigger to see if a counter
//     was put on Wakka this turn. If none were, the ability won't trigger at all.
//   [2025-06-06] You don't have to choose a target for Wakka's second ability. However, if you do
//     and the target is illegal as the ability tries to resolve, it won't resolve and none of its
//     effects will happen. You won't put a counter on Wakka.
//
// "A counter was put on Wakka this turn" is the journal's `counters-put` asked
// of Wakka itself: any kind of counter, whoever put it there.
const DAMAGE_TEXT =
  "Whenever Wakka deals combat damage to a player, destroy up to one target artifact that player controls and put a +1/+1 counter on Wakka.";
const CAPTAIN_TEXT =
  "Blitzball Captain — At the beginning of your end step, if a counter was put on Wakka this turn, put a +1/+1 counter on each other creature you control.";

export default defineCard({
  name: "Wakka, Devoted Guardian",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${DAMAGE_TEXT}\n${CAPTAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "trigger-player", filter: { type: "artifact" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { journaled: { what: "counters-put" } } },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: CAPTAIN_TEXT,
    },
  ],
});
