import { defineCard } from "../define.js";

const BOO_TEXT =
  "When Minsc & Boo enters and at the beginning of your upkeep, you may create Boo, a legendary 1/1 red Hamster creature token with trample and haste.";
const MAY_BOO = {
  kind: "may",
  prompt: "Create Boo, a legendary 1/1 red Hamster creature token with trample and haste?",
  effect: { kind: "create-token", token: "Boo", count: 1 },
} as const;
const REFLEXIVE_TEXT =
  "When you do, Minsc & Boo deals X damage to any target, where X is that creature's power. If the sacrificed creature was a Hamster, draw X cards.";

export default defineCard({
  name: "Minsc & Boo, Timeless Heroes",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Minsc"],
  loyalty: 3,
  canBeCommander: true,
  text: `${BOO_TEXT}\n+1: Put three +1/+1 counters on up to one target creature with trample or haste.\n−2: Sacrifice a creature. ${REFLEXIVE_TEXT}\nMinsc & Boo, Timeless Heroes can be your commander.`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MAY_BOO, resolve: null, text: BOO_TEXT },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      sameAbilityAs: 0,
      targets: [],
      effect: MAY_BOO,
      resolve: null,
      text: BOO_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", filter: { type: "creature", anyOf: [{ keyword: "trample" }, { keyword: "haste" }] } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
      resolve: null,
      text: "+1: Put three +1/+1 counters on up to one target creature with trample or haste.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed" },
            then: {
              kind: "reflexive-trigger",
              targets: ["any-target"],
              value: { aggregate: "sum", of: "power", filter: {}, in: { thisWay: "sacrificed" } },
              remember: { sacrificed: { set: { thisWay: "sacrificed" } } },
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "damage", amount: { triggerValue: true }, target: 0 },
                  {
                    kind: "conditional",
                    condition: { kind: "object-matches", object: { remembered: "sacrificed" }, filter: { subtype: "Hamster" } },
                    then: { kind: "draw", amount: { triggerValue: true } },
                  },
                ],
              },
              text: REFLEXIVE_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: `−2: Sacrifice a creature. ${REFLEXIVE_TEXT}`,
    },
  ],
});
