import { defineCard } from "../define.js";

export default defineCard({
  name: "Steamclaw",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}: Exile target card from a graveyard.\n{1}, Sacrifice this artifact: Exile target card from a graveyard.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{3}, {T}: Exile target card from a graveyard.",
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{1}, Sacrifice this artifact: Exile target card from a graveyard.",
    },
  ],
});
