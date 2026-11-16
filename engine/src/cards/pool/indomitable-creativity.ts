import { defineCard } from "../define.js";

// EDHREC rank 10801.
//
// Rulings:
//   [2017-02-09] If a player controls no permanents destroyed this way, that player reveals no
//     cards from their library and doesn't shuffle it.
//   [2017-02-09] If an artifact or creature is targeted but not destroyed (perhaps because it
//     gained indestructible or became an illegal target), it doesn't count as one of the artifacts
//     or creatures destroyed this way. An artifact or creature that's destroyed but put into a zone
//     other than a graveyard (for example, due to the effect of Rest in Peace) does count.
//   [2017-02-09] All of the exiled cards are put onto the battlefield at the same time.
//   [2017-02-09] If a player's library no longer contains an artifact or creature card when
//     instructed to reveal cards, that player reveals the entire library, exiles no cards, and
//     then shuffles it.
//   [2017-02-09] While revealing cards, a player stops as soon as they reveal a card that's an
//     artifact or a creature (or both). That player doesn't choose one type.
//
// Exactly X targets, destroyed together (By Force). Then each player one or
// more of whose permanents were destroyed this way (`whoseAmount` — the
// controller as it left; one only targeted, indestructible or regenerated
// isn't one) reveals once per such permanent: one reveal from the top until
// that many artifact or creature cards, each exiled as it's revealed (`exile:
// "found"`), the others staying where they are — the same cards a reveal per
// permanent would turn up, the earlier ones already gone. The players' finds
// are held (`choicesHeld`) and all enter at once, each under its owner's
// control; then those players shuffle.
export default defineCard({
  name: "Indomitable Creativity",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy X target artifacts and/or creatures. For each permanent destroyed this way, its controller reveals cards from the top of their library until an artifact or creature card is revealed and exiles that card. Those players put the exiled cards onto the battlefield, then shuffle.",
  targets: [{ kind: "any-number", of: "artifact-or-creature", min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      {
        kind: "for-each-player",
        who: "each-player",
        whoseAmount: { thisWay: "destroyed", who: "each" },
        choicesHeld: true,
        effect: {
          kind: "reveal-until-count",
          whose: "that-player",
          filter: { typesAnyOf: ["artifact", "creature"] },
          count: { thisWay: "destroyed", who: "each" },
          exile: "found",
          put: "battlefield",
          rest: "shuffle",
        },
      },
    ],
  },
});
