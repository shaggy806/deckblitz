import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 24491.
//
// "If you control a Swamp, you may sacrifice a creature rather than pay this
// spell's mana cost": an alternative cost (rule 118.9) gated on controlling
// a Swamp. "Each player exiles two cards from their hand": each player, in
// turn order from the caster (the active player, for a sorcery — ruling),
// chooses two of their own.

export default defineCard({
  name: "Mind Swords",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "If you control a Swamp, you may sacrifice a creature rather than pay this spell's mana cost.\nEach player exiles two cards from their hand.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "creature" }, text: "a creature" },
    condition: { kind: "controls", filter: { type: "land", subtype: "Swamp" }, atLeast: 1 },
  },
  effect: {
    kind: "for-each-player",
    who: "each-player",
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "hand",
      min: 2,
      max: 2,
      destination: "exile",
      unlinked: true,
      leftover: "stay",
    },
  },
});
