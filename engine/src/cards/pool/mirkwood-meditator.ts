import { defineCard } from "../define.js";

// EDHREC rank 23387.
//
// Rulings:
//   [2026-06-29] The ability of Mirkwood Meditator overwrites any previous effects that set its
//     power and/or toughness to specific values. Other effects that set these characteristics to
//     specific values that start to apply after the ability resolves will overwrite that part of
//     the effect.
//   [2026-06-29] Whenever a land you control enters, each landfall ability of permanents you
//     control will trigger. You can put them on the stack in any order. The last ability you put
//     on the stack will be the first one to resolve (as a result, you can have those abilities
//     resolve in the order of your choosing).
//   [2026-06-29] Effects that modify the power or toughness of Mirkwood Meditator without setting
//     it will apply to its new base power and toughness no matter when they started to take
//     effect. The same is true for counters that change its power and toughness.
//   [2026-06-29] A landfall ability triggers whenever a land you control enters for any reason. It
//     triggers whenever you play a land, as well as whenever a spell or ability puts a land onto
//     the battlefield under your control.
//   [2026-06-29] Because damage remains marked on a creature until the damage is removed as the
//     turn ends, nonlethal damage dealt to Mirkwood Meditator may become lethal if you change its
//     base toughness during that turn.
//   [2026-06-29] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.

export default defineCard({
  name: "Mirkwood Meditator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 4,
  text: "Landfall — Whenever a land you control enters, you may have this creature's base power and toughness become 4/2 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have this creature's base power and toughness become 4/2 until end of turn?",
        effect: {
          kind: "animate",
          target: "source",
          power: 4,
          toughness: 2,
          addTypes: [],
          addSubtypes: [],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may have this creature's base power and toughness become 4/2 until end of turn.",
    },
  ],
});
