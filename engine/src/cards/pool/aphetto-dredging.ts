import { defineCard } from "../define.js";

// EDHREC rank 17647.
// The type is chosen as it's cast, before its targets (the ruling): a group
// whose members share one creature type (`oneCreatureType`), the type kept as
// the spell's chosen creature type — at once when they share one, else asked
// among those they share — and checked again as it resolves.
export default defineCard({
  name: "Aphetto Dredging",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to three target creature cards of the creature type of your choice from your graveyard to your hand.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      max: 3,
      oneCreatureType: true,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
});
