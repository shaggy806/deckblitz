import { defineCard } from "../define.js";

// EDHREC rank 31064.

export default defineCard({
  name: "Trigon of Rage",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three charge counters on it.\n{R}{R}, {T}: Put a charge counter on this artifact.\n{2}, {T}, Remove a charge counter from this artifact: Target creature gets +3/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}{R}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{R}{R}, {T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{2}, {T}, Remove a charge counter from this artifact: Target creature gets +3/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 3 } },
      text: "This artifact enters with three charge counters on it.",
    },
  ],
});
