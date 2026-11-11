import { defineCard } from "../define.js";

// The flash permission is an optional additional cost (a `flash` kicker with
// no mana), paid by tapping three untapped flying creatures you control —
// summoning-sick ones too, since that's not a {T} cost (rule 302.6).
export default defineCard({
  name: "Tegwyll's Scouring",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "You may cast this spell as though it had flash by tapping three untapped creatures you control with flying in addition to paying its other costs.\n" +
    "Destroy all creatures. Create three 1/1 black Faerie Rogue creature tokens with flying.",
  kicker: {
    cost: "",
    keyword: "flash",
    flash: true,
    also: {
      text: "Tap three untapped creatures you control with flying",
      tapUntapped: { filter: { type: "creature", keyword: "flying" }, count: 3 },
    },
  },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" } },
      { kind: "create-token", token: "Faerie Rogue Token", count: 3 },
    ],
  },
});
