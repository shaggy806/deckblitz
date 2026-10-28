import { defineCard } from "../define.js";

export default defineCard({
  name: "Kulrath Knight",
  manaCost: "{3}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "wither"],
  text: "Flying\nWither (This deals damage to creatures in the form of -1/-1 counters.)\nCreatures your opponents control with counters on them can't attack or block.",
  static: [
    {
      // Any kind of counter, not just -1/-1 (the ruling): `kind` left out.
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "opponent", counters: { compare: { op: "gte", n: 1 } } },
      },
      restrictions: ["cant-attack", "cant-block"],
      text: "Creatures your opponents control with counters on them can't attack or block.",
    },
  ],
});
