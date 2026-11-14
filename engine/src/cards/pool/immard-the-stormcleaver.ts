import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// One ability with two trigger events. Putting a counter on or removing one
// is chosen as it resolves; removing one with none there removes nothing, so
// "when you remove a counter this way" doesn't trigger. The reflexive
// trigger's mode and target are chosen as it goes on the stack (rule 700.2).
const TRIGGER_TEXT =
  "Whenever Immard, the Stormcleaver enters or attacks, put a charge counter on it or remove one from it. When you remove a counter this way, choose one —";
const DAMAGE_MODE = "Immard deals 4 damage to any target.";
const KEYWORDS_MODE = "Immard gains lifelink and indestructible until end of turn.";

const EFFECT: EffectSpec = {
  kind: "modal",
  minModes: 1,
  maxModes: 1,
  modes: [
    {
      text: "Put a charge counter on Immard.",
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
    },
    {
      text: "Remove a charge counter from Immard.",
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "charge", compare: { op: "gte", n: 1 } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: "source", counter: "charge", amount: 1 },
            {
              kind: "reflexive-trigger",
              targets: [],
              effect: {
                kind: "modal",
                announced: true,
                minModes: 1,
                maxModes: 1,
                modes: [
                  {
                    text: DAMAGE_MODE,
                    targets: ["any-target"],
                    effect: { kind: "damage", amount: 4, target: 0 },
                  },
                  {
                    text: KEYWORDS_MODE,
                    effect: {
                      kind: "sequence",
                      effects: [
                        { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
                        { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
                      ],
                    },
                  },
                ],
              },
              text: `When you remove a counter this way, choose one — • ${DAMAGE_MODE} • ${KEYWORDS_MODE}`,
            },
          ],
        },
      },
    },
  ],
};

export default defineCard({
  name: "Immard, the Stormcleaver",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: `${TRIGGER_TEXT}\n• ${DAMAGE_MODE}\n• ${KEYWORDS_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
