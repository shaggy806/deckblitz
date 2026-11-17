import { defineCard } from "../define.js";

// EDHREC rank 11218. "Attacks or enters attacking" is one ability with two
// trigger events (`sameAbilityAs`): a declared attacker (rule 508.3a) and one
// put onto the battlefield attacking (508.4 — it never "attacked"), the
// `enters-attacking` trigger event. The {1}{R} is paid as it resolves (the
// ruling); "that creature's mana value" is the trigger object's, as it last
// existed if it has left (the ruling), the one Arni's own put-in entering
// attacking triggers again for (the ruling).

const TEXT =
  "Whenever a creature you control attacks or enters attacking, you may pay {1}{R}. If you do, you may put a creature card with mana value less than that creature's mana value from your hand onto the battlefield tapped and attacking.";

const EFFECT = {
  kind: "may",
  prompt: "Pay {1}{R} to put a creature card with lesser mana value from your hand onto the battlefield tapped and attacking?",
  cost: "{1}{R}",
  effect: {
    kind: "look-and-choose",
    zone: "hand",
    min: 0,
    max: 1,
    destination: "battlefield",
    enterTapped: true,
    attacking: "choose",
    leftover: "stay",
    filter: { type: "creature", manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } } },
  },
} as const;

export default defineCard({
  name: "Arni Metalbrow",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "event", event: "enters-attacking", who: "you-control", filter: { type: "creature" } },
      sameAbilityAs: 0,
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
