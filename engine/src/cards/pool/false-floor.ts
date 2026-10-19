import { defineCard } from "../define.js";

const EXILE_TEXT = "{2}, {T}, Exile this artifact: Exile all untapped creatures. Activate only as a sorcery.";

export default defineCard({
  name: "False Floor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\nCreatures enter tapped.\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
    {
      // Every player's creatures, this player's own included.
      affects: { scope: "self" },
      replacement: { event: "others-enter-battlefield", filter: { type: "creature" }, tapped: true },
      text: "Creatures enter tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, exileSelf: true },
      targets: [],
      effect: { kind: "exile-all", filter: { type: "creature", tapped: false } },
      resolve: null,
      sorcerySpeed: true,
      text: EXILE_TEXT,
    },
  ],
});
