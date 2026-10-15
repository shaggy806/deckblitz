import { defineCard } from "../define.js";

// EDHREC rank 20774.
//
// Rulings:
//   [2026-06-29] Galion's ability overwrites all previous effects that set a creature's power and
//     toughness to specific values. Other effects that set its power or toughness to specific
//     values that start to apply after the ability resolves will overwrite this effect.
//   [2026-06-29] As Galion's ability resolves, the base power and toughness of the targeted
//     creature are set to Galion's actual power and toughness, not its base power and toughness.
//     If Galion's power or toughness changes later in the turn, the other creature isn't affected.
//   [2026-06-29] Any effects that modify a creature's power and/or toughness without setting them
//     to a specific value (i.e. ones that don't affect base power and/or toughness) will apply
//     after its base power and toughness are set, regardless of the order those effects were
//     created. The same is true for counters that modify its power and toughness.

export default defineCard({
  name: "Galion, Elvenking's Butler",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Advisor"],
  power: 4,
  toughness: 4,
  text: "Whenever Galion attacks, choose up to one other target creature you control. Its base power and toughness become equal to Galion's power and toughness until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      // Galion's actual power and toughness, read once as it resolves (as it last existed if it
      // has left) and fixed for the turn — the rulings.
      effect: {
        kind: "animate",
        target: 0,
        power: { powerOf: "source" },
        toughness: { toughnessOf: "source" },
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever Galion attacks, choose up to one other target creature you control. Its base power and toughness become equal to Galion's power and toughness until end of turn.",
    },
  ],
});
