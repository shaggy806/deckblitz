import { defineCard } from "../define.js";

// EDHREC rank 13660. "Target Goblin or Orc you control" — either subtype
// (an OR), any permanent of yours that has one.

const SAC_TEXT =
  "{2}{B}{R}, {T}, Sacrifice this land: Put two +1/+1 counters on target Goblin or Orc you control. Activate only as a sorcery.";

export default defineCard({
  name: "Goblin-town",
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {B} or {R}.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {R}.",
    },
    {
      cost: { mana: "{2}{B}{R}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtypes: ["Goblin", "Orc"] } }],
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
