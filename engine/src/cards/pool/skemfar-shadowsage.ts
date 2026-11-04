import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, choose one —\n• Each opponent loses X life, where X is the greatest number of creatures you control that have a creature type in common.\n• You gain X life, where X is the greatest number of creatures you control that have a creature type in common.";

const X = { aggregate: "greatest-shared-creature-type", filter: { type: "creature", controlledBy: "you" } } as const;

// Read as the ability resolves, itself included if it's still yours (the ruling).
export default defineCard({
  name: "Skemfar Shadowsage",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Each opponent loses X life, where X is the greatest number of creatures you control that have a creature type in common.",
            effect: { kind: "lose-life", who: "each-opponent", amount: X },
          },
          {
            text: "You gain X life, where X is the greatest number of creatures you control that have a creature type in common.",
            effect: { kind: "gain-life", amount: X },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
