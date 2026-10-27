import { defineCard } from "../define.js";

// EDHREC rank 28699.

export default defineCard({
  name: "Baton of Courage",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  text: "Flash\nSunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)\nRemove a charge counter from this artifact: Target creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Remove a charge counter from this artifact: Target creature gets +1/+1 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
    },
  ],
});
