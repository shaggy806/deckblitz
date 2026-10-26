import { defineCard } from "../define.js";

// EDHREC rank 11702.

export default defineCard({
  name: "Savageborn Hydra",
  manaCost: "{X}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  keywords: ["double-strike"],
  text: "Double strike\nThis creature enters with X +1/+1 counters on it.\n{1}{R/G}: Put a +1/+1 counter on this creature. Activate only as a sorcery.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R/G}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}{R/G}: Put a +1/+1 counter on this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
