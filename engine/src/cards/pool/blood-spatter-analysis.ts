import { defineCard } from "../define.js";

const ENTERS = "When this enchantment enters, it deals 3 damage to target creature an opponent controls.";
const DIES =
  "Whenever one or more creatures die, mill a card and put a bloodstain counter on this enchantment. Then sacrifice it if it has five or more bloodstain counters on it. When you do, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Blood Spatter Analysis",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${ENTERS}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, batched: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          { kind: "add-counter", target: "source", counter: "bloodstain", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "bloodstain", compare: { op: "gte", n: 5 } },
            then: {
              kind: "sacrifice-source",
              then: {
                kind: "reflexive-trigger",
                targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
                effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
                text: "When you do, return target creature card from your graveyard to your hand.",
              },
            },
          },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
