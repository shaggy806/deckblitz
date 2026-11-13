import { defineCard } from "../define.js";

// Journey into Nyx (JOU). EDHREC rank 5468.
// Rulings:
//   You may exchange control of Perplexing Chimera and any spell cast by an opponent, not just
//     one with targets. Neither changes zones; only control is exchanged.
//   You may change any of the spell's targets. If you change a target, you must choose a legal
//     target for the spell. If you can't, you must leave the target the same.
//   If Perplexing Chimera leaves the battlefield or the spell leaves the stack before the
//     triggered ability resolves, you can't make the exchange.
//   In unusual cases you may not control Perplexing Chimera as the ability resolves; you can
//     still exchange control of it and the spell, and you, not the spell's new controller,
//     may change the spell's targets.
//   The change of control happens before new targets are chosen, so targeting restrictions
//     like "target creature you control" are judged from your side.
//
// The exchange is all or nothing (rule 701.12a: nothing if either is gone or
// one player controls both). The ability's controller chooses the new targets
// (rule 115.7d), only if the exchange happened ("If you do").

const TEXT =
  "Whenever an opponent casts a spell, you may exchange control of this creature and that spell. If you do, you may choose new targets for the spell. (If the spell becomes a permanent, you control that permanent.)";

export default defineCard({
  name: "Perplexing Chimera",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Chimera"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exchange control of Perplexing Chimera and that spell?",
        effect: {
          kind: "exchange-control",
          objects: ["source", "trigger-object"],
          then: { kind: "change-targets", target: "trigger-object", how: "choose-new" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
