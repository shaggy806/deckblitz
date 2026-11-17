import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 11860.
//
// Rulings:
//   The target permanents are exiled all at the same time.
//   If a player controls multiple permanents that were exiled this way, that
//     player first chooses which target they're considering, then they reveal
//     cards until they reveal a card that shares a type with that permanent as
//     it last existed on the battlefield, then they put that card onto the
//     battlefield and shuffle. They then repeat this process for the remaining
//     targets they controlled.
const TEXT =
  "Exile up to one target artifact, up to one target creature, up to one target enchantment, up to one target planeswalker, and/or up to one target land. For each permanent exiled this way, its controller reveals cards from the top of their library until they reveal a card that shares a card type with it, puts that card onto the battlefield, then shuffles.";

const upToOne = (type: "artifact" | "creature" | "enchantment" | "planeswalker" | "land") =>
  ({ kind: "optional", of: { kind: "permanent", filter: { type } } }) as const;

/**
 * Chaotic Transformation. The targets are exiled as one event. Then each
 * permanent exiled this way is replaced one at a time (rule 608.2f): the
 * players in turn order from the active player, as Divergent Transformations'
 * ruling has it, and a player who controlled two or more picks which of theirs
 * goes next, after the one before it is done (the ruling) — a `for-each-target`
 * with `turnOrder` and `groupChooses`. One object chosen for two of the
 * targets (an artifact creature, rule 115.3) is one permanent exiled, so one
 * reveal (`eachObjectOnce`). "A card that shares a card type with it" reads
 * the permanent as it last existed on the battlefield (the ruling); a card
 * that can't enter (a kindred instant sharing kindred, rule 400.4a) stays in
 * the library and is shuffled with the rest.
 */
export default defineCard({
  name: "Chaotic Transformation",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [upToOne("artifact"), upToOne("creature"), upToOne("enchantment"), upToOne("planeswalker"), upToOne("land")],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0 },
          { kind: "exile", target: 1 },
          { kind: "exile", target: 2 },
          { kind: "exile", target: 3 },
          { kind: "exile", target: 4 },
        ],
      },
      {
        kind: "for-each-target",
        from: 0,
        turnOrder: true,
        groupChooses: true,
        only: { thisWay: "exiled" },
        eachObjectOnce: true,
        effect: {
          kind: "reveal-until",
          whose: { controllerOf: 0 },
          filter: { sharesCardTypeWith: 0 },
          put: "battlefield",
          rest: "shuffle",
        },
      },
    ],
  },
});
