import { defineCard } from "../define.js";

// EDHREC rank 10946.
//
// Rulings:
//   If you discard a card, the creature only gains haste until end of turn, but the +1/+1 counter
//     and Vampire subtype remain indefinitely.
//   If the entering creature leaves the battlefield before the triggered ability resolves, you may
//     still discard a card. The rest of the ability has no effect.
//   You decide whether to discard a card as the triggered ability resolves.
//
// Scarlet Spider, Kaine's "you may discard a card. If you do, …", with the
// rest on the entering creature (Wartime Protestors' trigger-object).

const TRIGGER_TEXT =
  "Whenever another creature you control enters, you may discard a card. If you do, put a +1/+1 counter on that creature, it gains haste until end of turn, and it becomes a Vampire in addition to its other types.";

export default defineCard({
  name: "Olivia, Mobilized for War",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to put a +1/+1 counter on that creature, give it haste and make it a Vampire?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
                  { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
                  { kind: "add-types", target: "trigger-object", addSubtypes: ["Vampire"], duration: "permanent" },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
