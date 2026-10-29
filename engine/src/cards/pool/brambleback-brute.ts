import { defineCard } from "../define.js";

// EDHREC rank 21057.

export default defineCard({
  name: "Brambleback Brute",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 5,
  text: "This creature enters with two -1/-1 counters on it.\n{1}{R}, Remove a counter from this creature: Target creature can't block this turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, removeCounter: { kind: "any", count: 1 } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{1}{R}, Remove a counter from this creature: Target creature can't block this turn. Activate only as a sorcery.",
      sorcerySpeed: true,
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
