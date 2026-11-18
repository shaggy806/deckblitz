import { defineCard } from "../define.js";

// EDHREC rank 17473.
//
// Rulings:
//   The effects of Xathrid Gorgon's ability don't depend on the petrification counter. If that
//     counter is removed, the creature remains a colorless artifact with defender, and so on.
//
// Every part lasts for good (rule 611.2a), on that creature in this stint
// (rule 400.7): a `become` with `duration: "permanent"` (Ashnod's
// Transmogrant's added type, Moonlace's colorless, Tatyova's keyword), and a
// `prohibit` of `activate` on it, mana abilities included, for good — Braided
// Net's, with no end.
const PETRIFY_TEXT =
  "{2}{B}, {T}: Put a petrification counter on target creature. It gains defender and becomes a colorless artifact in addition to its other types. Its activated abilities can't be activated.";

export default defineCard({
  name: "Xathrid Gorgon",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 3,
  toughness: 6,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${PETRIFY_TEXT} (A creature with defender can't attack.)`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "petrification", amount: 1 },
          {
            kind: "become",
            target: 0,
            keywords: ["defender"],
            setColors: [],
            addTypes: ["artifact"],
            duration: "permanent",
          },
          {
            kind: "prohibit",
            prohibits: [{ act: "activate", who: "each-player", target: 0 }],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: PETRIFY_TEXT,
    },
  ],
});
