import { defineCard } from "../define.js";

// EDHREC rank 18907.

export default defineCard({
  name: "Chainbreaker",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 3,
  toughness: 3,
  text: "This creature enters with two -1/-1 counters on it.\n{3}, {T}: Remove a -1/-1 counter from target creature.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: { kind: "remove-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "{3}, {T}: Remove a -1/-1 counter from target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: "This creature enters with two -1/-1 counters on it.",
    },
  ],
});
