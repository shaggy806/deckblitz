import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 23210.

export default defineCard({
  name: "Ivory Giant",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 4,
  suspend: { n: 5, cost: "{W}" },
  text: "When this creature enters, tap all nonwhite creatures.\nSuspend 5—{W} (Rather than cast this card from your hand, you may pay {W} and exile it with five time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", notColors: ["W"] } },
      resolve: null,
      text: "When this creature enters, tap all nonwhite creatures.",
    },
  ],
});
