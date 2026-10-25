import { defineCard } from "../define.js";

// EDHREC rank 8537.
//
// Rulings:
//   [2016-11-08] The two creatures that are put onto the battlefield are put onto the battlefield
//     sequentially. Triggered abilities of the second won't see the first enter the battlefield.
//   [2016-11-08] Causing an opponent to lose the game after you've announced that you're casting a
//     spell with undaunted and determined its total cost won't cause you to have to pay more mana.
//   [2016-11-08] Effects that reduce what you pay to cast a spell don't affect its mana value.
//   [2016-11-08] You can't cast Divergent Transformations without two target creatures. If a
//     targeted creature becomes an illegal target for Divergent Transformations after it's been
//     cast, its controller won't exile or replace that creature, but the other creature is still
//     affected.
//   [2016-11-08] If one player's creatures are exiled this way, that player repeats this process
//     twice.
//   [2016-11-08] Any abilities that trigger during the resolution of Divergent Transformations
//     will wait to be put onto the stack until Divergent Transformations finishes resolving. An
//     ability that triggers on the first creature entering the battlefield may target the second
//     creature and vice versa.
//   [2016-11-08] If the controller of a creature exiled this way has no creature cards left in
//     their library, that player reveals the cards in their library, then shuffles it.
//   [2016-11-08] If two players' creatures are exiled this way, start with the player whose turn
//     it is. If that player controlled a creature exiled this way, that player follows the process
//     on Divergent Transformations to replace it. If not, proceed to the next player in turn
//     order. Repeat until the players who controlled the exiled creatures have each replaced those
//     creatures.

export default defineCard({
  name: "Divergent Transformations",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { opponents: true },
  },
  text: "Undaunted (This spell costs {1} less to cast for each opponent.)\nExile two target creatures. For each of those creatures, its controller reveals cards from the top of their library until they reveal a creature card, puts that card onto the battlefield, then shuffles the rest into their library.",
  // Both exiled as one event; then, from the active player on in turn order
  // (the ruling), each player who controlled a creature exiled this way
  // replaces it — twice for a player who controlled both — each reveal on its
  // own, so the second creature enters after the first (the ruling). A
  // target gone illegal isn't exiled, so its controller reveals nothing.
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0 },
          { kind: "exile", target: 1 },
        ],
      },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", who: "that-player", atLeast: 1 },
              then: {
                kind: "reveal-until",
                whose: "that-player",
                filter: { type: "creature" },
                put: "battlefield",
                rest: "shuffle",
              },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", who: "that-player", atLeast: 2 },
              then: {
                kind: "reveal-until",
                whose: "that-player",
                filter: { type: "creature" },
                put: "battlefield",
                rest: "shuffle",
              },
            },
          ],
        },
      },
    ],
  },
});
