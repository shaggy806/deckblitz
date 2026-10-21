import { defineCard } from "../define.js";

const ENTER_TEXT = "When this Aura enters, put a +1/+1 counter on enchanted creature.";
const ATTACK_TEXT =
  "Whenever this creature attacks, double the number of +1/+1 counters on it. Then if it has power 10 or greater, draw a card.";
const GRANT_TEXT = `Enchanted creature has "${ATTACK_TEXT}"`;

export default defineCard({
  name: "Level Up",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${GRANT_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "double-counters", target: "source", counter: "+1/+1" },
              {
                kind: "conditional",
                condition: { kind: "source", filter: { power: { op: "gte", n: 10 } } },
                then: { kind: "draw", amount: 1 },
              },
            ],
          },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
