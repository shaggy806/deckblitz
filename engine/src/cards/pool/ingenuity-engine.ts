import { defineCard } from "../define.js";

export default defineCard({
  name: "Ingenuity Engine",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\n{1}, {T}, Sacrifice an artifact: Return target artifact you control to its owner's hand.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{1}, {T}, Sacrifice an artifact: Return target artifact you control to its owner's hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
