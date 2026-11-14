import { defineCard } from "../define.js";

// EDHREC rank 8302.
//
// The villainous choice is `each-player-may`'s `choices` (rule 701.56), asked of
// the defending player (the attack trigger's player). Its second option is the
// villain's: a creature of their choice that player controls (`choose-permanents`,
// not a target), gained until end of turn, tapped, and stated to be attacking that
// player (`is-attacking`, rule 508.4) — never declared, so no "attacks" trigger
// sees it and no attack restriction applies (508.4c, the ruling).
//
// Rulings:
//   [2023-10-13] If a spell or ability requires multiple players to face a villainous choice, the
//     result is a little different from other effects in Magic. In that case, the first player in
//     turn order makes their choice and the action for that choice is performed before the next
//     player makes their choice. Then each of the remaining players repeat this process in turn
//     order.
//   [2023-10-13] A player facing a villainous choice can always choose either option, even if one
//     or both of the options are impossible. For example, if one of the options is to sacrifice a
//     creature, a player who controls no creatures can still choose that option.
//   [2023-10-13] When a player faces a villainous choice, they first choose one of the two
//     options, then all actions in the chosen option are performed.
//   [2023-10-13] When a creature becomes attacking this way, it wasn't declared as an attacker, so
//     triggered abilities that trigger when a creature attacks won't trigger. Similar, all
//     restrictions or costs to attack are ignored. For example, if the chosen creature has
//     defender, it could still end up being an attacking creature this way.

export default defineCard({
  name: "Midnight Crusader Shuttle",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  text: "Midnight Entity — Whenever this Vehicle attacks, defending player faces a villainous choice — That player sacrifices a creature of their choice, or you gain control of a creature of your choice that player controls until end of turn. If you gain control of a creature this way, tap it, and it's attacking that player.\nCrew 2",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        choices: [
          {
            text: "That player sacrifices a creature of their choice.",
            effect: { kind: "sacrifice", who: "that-player", filter: { type: "creature" }, count: 1 },
          },
          {
            text: "You gain control of a creature of your choice that player controls until end of turn. If you gain control of a creature this way, tap it, and it's attacking that player.",
            effect: {
              kind: "choose-permanents",
              filter: { type: "creature" },
              controlledByPlayer: "that-player",
              min: 1,
              upTo: 1,
              prompt: "Gain control of a creature that player controls",
              then: {
                kind: "sequence",
                effects: [
                  { kind: "gain-control", target: 0, untilEndOfTurn: true },
                  { kind: "tap", target: 0 },
                  { kind: "is-attacking", target: 0, at: { player: "that-player" } },
                ],
              },
            },
          },
        ],
      },
      resolve: null,
      text: "Midnight Entity — Whenever this Vehicle attacks, defending player faces a villainous choice — That player sacrifices a creature of their choice, or you gain control of a creature of your choice that player controls until end of turn. If you gain control of a creature this way, tap it, and it's attacking that player.",
    },
  ],
});
