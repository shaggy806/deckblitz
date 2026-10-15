import { defineCard } from "../define.js";

// EDHREC rank 16676.
//
// Iron Hills' shape; "Bear, Spider, or Wolf" is `subtypes`, an any-of.

const SAC_TEXT =
  "{2}{B}{G}, {T}, Sacrifice this land: Put two +1/+1 counters on target Bear, Spider, or Wolf you control. Activate only as a sorcery.";

export default defineCard({
  name: "Mirkwood",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {B} or {G}.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {G}.",
    },
    {
      cost: { mana: "{2}{B}{G}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtypes: ["Bear", "Spider", "Wolf"] } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
