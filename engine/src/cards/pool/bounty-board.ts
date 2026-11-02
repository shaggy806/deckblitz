import { defineCard } from "../define.js";

const BOUNTY = "{1}, {T}: Put a bounty counter on target creature. Activate only as a sorcery.";
const DIES = "Whenever a creature with a bounty counter on it dies, each of its controller's opponents draws a card and gains 2 life.";

// Any bounty counter, from any Bounty Board or anywhere else (the ruling).
export default defineCard({
  name: "Bounty Board",
  manaCost: "{3}",
  types: ["artifact"],
  text: `{T}: Add one mana of any color.\n${BOUNTY}\n${DIES}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "bounty", amount: 1 },
      sorcerySpeed: true,
      resolve: null,
      text: BOUNTY,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", counters: { kind: "bounty", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, who: "opponents-of-trigger-controller" },
          { kind: "gain-life", amount: 2, who: "opponents-of-trigger-controller" },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
