import { defineCard } from "../define.js";

const DESTROY_TEXT =
  "{3}, {T}, Pay X {E}, Sacrifice this land: Destroy target nonland permanent with mana value X. Activate only as a sorcery.";

// EDHREC rank 5381.
export default defineCard({
  name: "HELIOS One",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n{1}, {T}: You get {E} (an energy counter).\n${DESTROY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: "{1}, {T}: You get {E} (an energy counter).",
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self", do: { kind: "pay-energy", amount: "x" } },
      sorcerySpeed: true,
      targets: [{ kind: "permanent", filter: { notTypes: ["land"], manaValue: { op: "eq", n: "x" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
