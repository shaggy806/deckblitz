import { defineCard } from "../define.js";

// EDHREC rank 11257.
//
// Rulings:
//   [2025-04-04] Tapping a creature won’t reduce colored mana components of harmonize costs.
//   [2025-04-04] A spell cast using harmonize will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2025-04-04] If two targets are chosen, you must choose to give each of them a +1/+1 counter.
//     If only one of those two creatures is still a legal target at the time the spell resolves,
//     it will receive only one counter.
//   [2025-04-04] You must still follow any timing restrictions and permissions, including those
//     based on the card’s type. For instance, you can cast a sorcery using harmonize only when you
//     could normally cast a sorcery.

const TEXT =
  "Distribute two +1/+1 counters among one or two target creatures you control. Creatures you control with counters on them gain vigilance and trample until end of turn.";
const HARMONIZE_TEXT =
  "Harmonize {4}{G} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell.)";
const WITH_COUNTERS = { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } } as const;

export default defineCard({
  name: "Synchronized Charge",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${TEXT}\n${HARMONIZE_TEXT}`,
  targets: ["creature-you-control", { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slot: 0 } } }],
  // The Earth Crystal's distribution: two targets get one each (one gone
  // illegal gets nothing — the ruling: "a slot found illegal was still
  // chosen"), one target gets both. Then every creature you control with a
  // counter on it at that moment gains the keywords.
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target-chosen", index: 1 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          ],
        },
        else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      { kind: "grant-keyword-all", filter: WITH_COUNTERS, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: WITH_COUNTERS, keyword: "trample", duration: "end-of-turn" },
    ],
  },
  harmonize: { cost: "{4}{G}" },
});
