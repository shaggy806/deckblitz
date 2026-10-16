import { defineCard } from "../define.js";

// EDHREC rank 8901.
//
// Rulings:
//   [2024-09-20] If you destroy some of your own permanents with Convert to Slime, they'll go to
//     your graveyard in time for their types to be counted for the delirium ability.
//   [2024-09-20] Use the mana value of the destroyed permanents as they last existed on the
//     battlefield to determine the value of X.
//
// Three optional slots, destroyed as one instruction; the delirium check
// follows it, so what it put into your graveyard counts. X sums the mana
// values of what was destroyed, each read through its last-known information.
const DESTROYED = { thisWay: "destroyed", sumOf: "mana-value" } as const;

export default defineCard({
  name: "Convert to Slime",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Destroy up to one target artifact, up to one target creature, and up to one target enchantment.\nDelirium — Then if there are four or more card types among cards in your graveyard, create an X/X green Ooze creature token, where X is the total mana value of permanents destroyed this way.",
  targets: [
    { kind: "optional", of: "artifact" },
    { kind: "optional", of: "creature" },
    { kind: "optional", of: "enchantment" },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "destroy", target: 1 },
          { kind: "destroy", target: 2 },
        ],
      },
      {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: {
          kind: "create-token",
          token: "Ooze Token (Convert to Slime)",
          count: 1,
          basePt: { power: DESTROYED, toughness: DESTROYED },
        },
      },
    ],
  },
});
