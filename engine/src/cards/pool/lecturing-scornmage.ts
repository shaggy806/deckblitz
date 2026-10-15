import { defineCard } from "../define.js";

// EDHREC rank 18189.
//
// Repartee is Graduation Day's cast trigger: the spell's targets are read as
// it's cast, so it resolves whatever becomes of them (the rulings).
//
// Rulings:
//   [2026-03-20] A repartee ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.
//   [2026-03-20] It doesn't matter if the creature or creatures targeted by the spell that caused
//     the repartee ability to trigger leave the battlefield or stop being creatures before that
//     spell resolves. As long as that spell targeted one or more creatures when it was cast, the
//     repartee ability will trigger and later resolve.

export default defineCard({
  name: "Lecturing Scornmage",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 1,
  text: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.",
    },
  ],
});
