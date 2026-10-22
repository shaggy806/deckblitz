import { defineCard } from "../define.js";

// EDHREC rank 21014.

export default defineCard({
  name: "Skeleton Ship",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 0,
  toughness: 3,
  text: "When you control no Islands, sacrifice Skeleton Ship.\n{T}: Put a -1/-1 counter on target creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "{T}: Put a -1/-1 counter on target creature.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Islands, sacrifice Skeleton Ship.",
    },
  ],
});
