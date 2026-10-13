import { defineCard } from "../define.js";

// EDHREC rank 8155.
//
// Rulings:
//   [2024-09-20] If the target creature is an illegal target as Floodpits Drowner's last ability
//     tries to resolve, it won't resolve and none of its effects will happen. Floodpits Drowner
//     won't be shuffled into its owner's library.

const ENTER = "When this creature enters, tap target creature an opponent controls and put a stun counter on it.";
const SHUFFLE =
  "{1}{U}, {T}: Shuffle this creature and target creature with a stun counter on it into their owners' libraries.";

export default defineCard({
  name: "Floodpits Drowner",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "vigilance"],
  text: `Flash\nVigilance\n${ENTER}\n${SHUFFLE}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", counters: { kind: "stun", compare: { op: "gte", n: 1 } } },
        },
      ],
      // One instruction: both leave together. An illegal target stops the
      // whole ability, so the Drowner stays (the ruling).
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "shuffle-into-library", target: "source" },
          { kind: "shuffle-into-library", target: 0 },
        ],
      },
      resolve: null,
      text: SHUFFLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
