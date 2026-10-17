import { defineCard } from "../define.js";

// EDHREC rank 11349.
//
// Rulings:
//   [2023-10-13] As Renegade Silent phases out, Auras and Equipment attached to it also phase out
//     at the same time. … it will phase in with any counters it had on it.
//   [2023-10-13] Permanents phase back in during their controller's untap step, immediately before
//     that player untaps their permanents.
//   [2023-10-13] If an opponent gains control of your Renegade Silent until end of turn, it will
//     phase out while they still have control of it. … it phases in under your control as that
//     opponent's next untap step begins.
//
// "Up to one": with no creature chosen it has no targets and still puts the
// counter on and phases out; a creature you don't control is one an opponent
// controls. The goad, the counter and the phasing are one ability's steps in
// order.
const TEXT =
  "At the beginning of your end step, goad up to one target creature you don't control and put a +1/+1 counter on this creature. This creature phases out.";

export default defineCard({
  name: "Renegade Silent",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Alien", "Horror"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Treat it and anything attached to it as though they don't exist until your next turn.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "phase-out", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
