import { defineCard } from "../define.js";

// EDHREC rank 12834. "Target Dwarf you control" is any Dwarf permanent you
// control (changeling included) — Captivating Cave's shape, narrowed.

const SAC_TEXT =
  "{2}{R}{W}, {T}, Sacrifice this land: Put two +1/+1 counters on target Dwarf you control. Activate only as a sorcery.";

export default defineCard({
  name: "Iron Hills",
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {R} or {W}.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {W}.",
    },
    {
      cost: { mana: "{2}{R}{W}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Dwarf" } }],
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
