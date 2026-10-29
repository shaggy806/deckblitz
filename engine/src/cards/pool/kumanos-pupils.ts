import { defineCard } from "../define.js";

const TEXT = "If a creature dealt damage by this creature this turn would die, exile it instead.";

export default defineCard({
  name: "Kumano's Pupils",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      text: TEXT,
    },
  ],
});
