import { defineCard } from "../define.js";

// "That player" owns the hit-counter cards counted: the condition is read
// with them as its "you" (`of-player`). Etrata's owner shuffles their
// library whatever happens (its rulings): Etrata with it if it's still on
// the battlefield, the library alone otherwise.
export default defineCard({
  name: "Etrata, the Silencer",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 3,
  toughness: 5,
  text:
    "Etrata can't be blocked.\n" +
    "Whenever Etrata deals combat damage to a player, exile target creature that player controls and put a hit counter on that card. That player loses the game if they own three or more exiled cards with hit counters on them. Etrata's owner shuffles Etrata into their library.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, withCounters: { kind: "hit", amount: 1 } },
          {
            kind: "for-each-player",
            who: "trigger-player",
            effect: {
              kind: "conditional",
              condition: {
                kind: "of-player",
                player: "that-player",
                condition: {
                  kind: "cards-in-exile",
                  atLeast: 3,
                  filter: { ownedBy: "you", counters: { kind: "hit", compare: { op: "gte", n: 1 } } },
                },
              },
              then: { kind: "lose-game", who: "that-player" },
            },
          },
          {
            kind: "conditional",
            condition: { kind: "source-on-battlefield" },
            then: { kind: "shuffle-into-library", target: "source" },
            else: { kind: "as-player", who: { ownerOf: "source" }, effect: { kind: "shuffle-library" } },
          },
        ],
      },
      resolve: null,
      text: "Whenever Etrata deals combat damage to a player, exile target creature that player controls and put a hit counter on that card. That player loses the game if they own three or more exiled cards with hit counters on them. Etrata's owner shuffles Etrata into their library.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "Etrata can't be blocked.",
    },
  ],
});
