import { defineCard } from "../define.js";

// EDHREC rank 11580. Up to X targets, X announced first (rule 601.2b–c —
// Pest Infestation's group); they return together, one instruction. Exiled
// only as it resolves: countered, or with every target gone, it goes to the
// graveyard (rule 608.2b).
export default defineCard({
  name: "Divergent Equation",
  manaCost: "{X}{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return up to X target instant and/or sorcery cards from your graveyard to your hand.\nExile Divergent Equation.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      max: "x",
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
  exileOnResolve: true,
});
