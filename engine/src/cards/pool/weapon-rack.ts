import { defineCard } from "../define.js";

export default defineCard({
  name: "Weapon Rack",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three +1/+1 counters on it.\n{T}: Move a +1/+1 counter from this artifact onto target creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1" },
      resolve: null,
      text: "{T}: Move a +1/+1 counter from this artifact onto target creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This artifact enters with three +1/+1 counters on it.",
    },
  ],
});
