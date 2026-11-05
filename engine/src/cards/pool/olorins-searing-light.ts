import { defineCard } from "../define.js";

// EDHREC rank 4724.
//
// Rulings:
//   [2023-11-03] First, the active player (or, if it's not an opponent's turn, the next opponent
//     in turn order) chooses which creature they'll exile, then each other opponent in turn order
//     does the same, knowing choices made before their choice. Then all those creatures are exiled
//     simultaneously.
//   [2023-11-03] Check to see if there are two or more instant and/or sorcery cards in your
//     graveyard as the spell resolves to determine whether the spell mastery ability applies. The
//     spell itself won't count because it's still on the stack as you make this check.
//   [2023-11-03] If a player controls two or more creatures tied for the greatest power among
//     creatures they control, that player chooses one of them to exile.
//   [2023-11-03] Use the power of each exiled creature as it last existed on the battlefield to
//     determine how much damage is dealt to each opponent.
//
// Each opponent's creature is read off `thisWay`'s "each": its controller as it left, its power as
// it last existed there.

export default defineCard({
  name: "Olórin's Searing Light",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Each opponent exiles a creature with the greatest power among creatures that player controls.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, Olórin's Searing Light deals damage to each opponent equal to the power of the creature they exiled.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: "each-opponent",
        startingWith: "active-player",
        for: {
          permanent: {
            type: "creature",
            controlledBy: "you",
            greatestAmongItsController: { of: "power", among: { type: "creature" } },
          },
          own: true,
          prompt: "Choose a creature with the greatest power among creatures you control to exile",
        },
      },
      { kind: "for-each-voted", which: "voted", simultaneous: true, effect: { kind: "exile", target: 0 } },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: {
          kind: "damage",
          who: "each-opponent",
          amount: { thisWay: "exiled", who: "each", sumOf: "power" },
        },
      },
    ],
  },
});
