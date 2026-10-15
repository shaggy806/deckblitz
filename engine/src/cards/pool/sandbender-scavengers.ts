import { defineCard } from "../define.js";

// EDHREC rank 17218.
//
// Rulings:
//   [2025-10-02] Use Sandbender Scavengers's power as it last existed on the battlefield to
//     determine which creature cards may be targeted with its last ability.
//
// Undead Butler's "you may exile it. When you do" shape: the reflexive
// trigger targets only once the exile has happened, so the Scavengers itself
// can't be the card returned. Its filter is Alesha's, reading the power the
// creature died with (rule 608.2h — the trigger object as it last existed).

const SAC_TEXT = "Whenever you sacrifice another permanent, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  "When this creature dies, you may exile it. When you do, return target creature card with mana value less than or equal to this creature's power from your graveyard to the battlefield.";

export default defineCard({
  name: "Sandbender Scavengers",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: `${SAC_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Sandbender Scavengers?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  {
                    kind: "card-in-graveyard",
                    whose: "you",
                    filter: {
                      type: "creature",
                      manaValue: { op: "lte", n: { amount: { powerOf: "trigger-object" } } },
                    },
                  },
                ],
                effect: { kind: "put-onto-battlefield", target: 0 },
                text: "When you do, return target creature card with mana value less than or equal to this creature's power from your graveyard to the battlefield.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
