import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 16067.
//
// Rulings:
//   Disintegrated creatures don't go to the graveyard at all before being
//     exiled, so nothing triggers on them dying.
//   The "can't regenerate" is an effect of Disintegrate, not of the damage:
//     it works even if the damage is prevented or redirected.
//
// So both halves follow the target whether or not damage was dealt; "if it's
// a creature" is read as the spell resolves (Mythos of Nethroi's check).

export default defineCard({
  name: "Disintegrate",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Disintegrate deals X damage to any target. If it's a creature, it can't be regenerated this turn, and if it would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "prohibit", target: 0, regeneration: true },
            { kind: "exile-if-dies-this-turn", target: 0 },
          ],
        },
      },
    ],
  },
});
