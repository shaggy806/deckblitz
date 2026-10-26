import { defineCard } from "../define.js";

// EDHREC rank 25097.

export default defineCard({
  name: "Mournwhelk",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  evoke: { cost: "{3}{B}" },
  text: "When this creature enters, target player discards two cards.\nEvoke {3}{B} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: "When this creature enters, target player discards two cards.",
    },
  ],
});
