import { defineCard } from "../define.js";

const BONUS = "Enchanted creature gets +1/+0.";
const UPKEEP =
  "At the beginning of your upkeep, put a +1/+0 counter on enchanted creature. If that creature has three or more +1/+0 counters on it, it deals damage equal to its power to its controller, then destroy that creature and it can't be regenerated.";

export default defineCard({
  name: "Consuming Ferocity",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant non-Wall creature\n${BONUS}\n${UPKEEP}`,
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", notSubtypes: ["Wall"] } }],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: BONUS }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "attached", counter: "+1/+0", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "host-now", filter: { counters: { kind: "+1/+0", compare: { op: "gte", n: 3 } } } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "damage", amount: { powerOf: "attached" }, who: { controllerOf: "attached" }, from: "attached" },
                { kind: "destroy", target: "attached", cantBeRegenerated: true },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
