import { defineCard } from "../define.js";

// EDHREC rank 21897.
//
// "Becomes a Werewolf" replaces its creature types for good (`add-types`'
// `setSubtypes`, the ruling: no longer a Human). "Activate only once" is once
// for as long as the object exists — the `exhaust` bookkeeping, Haunted
// Screen's.
//
// Rulings:
//   As Mild-Mannered Librarian's last ability resolves, it loses its other creature types and
//     becomes a Werewolf. It's no longer a Human.

const TEXT =
  "{3}{G}: This creature becomes a Werewolf. Put two +1/+1 counters on it and you draw a card. Activate only once.";

export default defineCard({
  name: "Mild-Mannered Librarian",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", setSubtypes: ["Werewolf"], duration: "permanent" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      exhaust: true,
      text: TEXT,
    },
  ],
});
