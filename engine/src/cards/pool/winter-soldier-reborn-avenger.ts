import { defineCard } from "../define.js";

// EDHREC rank 12509.
//
// Alesha's target, read live: a card whose mana value is above Winter
// Soldier's power as the ability resolves is an illegal target, and nothing
// returns. "If a Hero enters this way" picks which return happens — one that
// enters with the extra +1/+1 counter (rule 614.1c, so its enters triggers
// see it) or a plain one — off the card as it is in the graveyard.

const ATTACK_TEXT =
  "Whenever Winter Soldier attacks, return target creature card with mana value less than or equal to Winter Soldier's power from your graveyard to the battlefield. If a Hero enters this way, it enters with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Winter Soldier, Reborn Avenger",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 5,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Hero" } },
        then: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 1 } },
        else: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
