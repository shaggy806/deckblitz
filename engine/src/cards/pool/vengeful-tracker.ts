import { defineCard } from "../define.js";

// EDHREC rank 13864. "Them" is the sacrificing opponent — the sacrifice
// trigger's `trigger-player` (Bloodroot Apothecary's "that player").
const TEXT = "Whenever an opponent sacrifices an artifact, this creature deals 2 damage to them.";

export default defineCard({
  name: "Vengeful Tracker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "opponent", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
