import { defineCard } from "../define.js";

const SAC_TEXT = "Sacrifice a Thrull: Put three time counters on this Aura.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, remove a time counter from this Aura. If there are no time counters on this Aura, sacrifice it.";
const TAP_TEXT =
  "Tap enchanted land: Attacking creatures you control get +2/-1 until end of turn. Activate only if enchanted land is untapped.";

export default defineCard({
  name: "Tourach's Gate",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land you control\n${SAC_TEXT}\n${UPKEEP_TEXT}\n${TAP_TEXT}`,
  targets: ["land-you-control"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Thrull" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "time", amount: 3 },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { hostOfSource: true } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, controlledBy: "you" },
        power: 2,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "time", compare: { op: "eq", n: 0 } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
