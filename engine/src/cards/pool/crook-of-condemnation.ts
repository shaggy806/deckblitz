import { defineCard } from "../define.js";

export default defineCard({
  name: "Crook of Condemnation",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}: Exile target card from a graveyard.\n{1}, Exile this artifact: Exile all graveyards.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{1}, {T}: Exile target card from a graveyard.",
    },
    {
      cost: { mana: "{1}", tap: false, exileSelf: true },
      targets: [],
      effect: { kind: "exile-graveyard", target: "each-player" },
      resolve: null,
      text: "{1}, Exile this artifact: Exile all graveyards.",
    },
  ],
});
