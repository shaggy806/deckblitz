import { defineCard } from "../define.js";

// EDHREC rank 13594.

export default defineCard({
  name: "The Monumental Facade",
  colors: [],
  types: ["land"],
  subtypes: ["Sphere"],
  text: "This land enters with two oil counters on it.\n{T}: Add {C}.\n{T}, Remove an oil counter from this land: Put an oil counter on target artifact or creature you control. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "oil", count: 1 } },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "add-counter", target: 0, counter: "oil", amount: 1 },
      resolve: null,
      text: "{T}, Remove an oil counter from this land: Put an oil counter on target artifact or creature you control. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: "This land enters with two oil counters on it.",
    },
  ],
});
