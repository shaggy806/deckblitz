import { defineCard } from "../define.js";

// The last line: a static permission over every graveyard (`anyGraveyard`)
// with a land allowance and a spell allowance spent apart (`landAndSpell`),
// both only for cards put there from a library this turn.
// EDHREC rank 7569.
//
// Rulings:
//   [2024-06-07] If you play a land or cast a spell from a graveyard using another permission, it
//     won't stop you from using Coram's permission to do the same thing later in the turn,
//     provided you haven't already done so.
//   [2024-06-07] You pay all costs and follow all timing rules for lands played and spells cast
//     this way.
//   [2024-06-07] The value of X will change as the greatest power among creature cards in all
//     graveyards changes.
//   [2024-06-07] If it's your turn, you control Coram, and another player has permission to play a
//     card in a graveyard that was put there from a library this turn (perhaps because it's an
//     instant card they own that has flashback), whoever gets priority sooner will have the first
//     chance to play that card. In most cases, this will be you, since the active player receives
//     priority after a spell or ability resolves.
//   [2024-06-07] Coram's first ability applies only while it is on the battlefield. In all other
//     zones, its power is 0.
//   [2024-06-07] If you play a land, cast a spell, or both using the permission granted by Coram's
//     last ability and then have a new Coram come under your control in the same turn, you can
//     still play a land, cast a spell, or both using the new Coram's permission.
//   [2024-06-07] Once you begin to cast a spell this way, losing control of Coram won't affect it.
//     You can finish casting it as normal.

export default defineCard({
  name: "Coram, the Undertaker",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 0,
  toughness: 5,
  text: "Coram gets +X/+0, where X is the greatest power among creature cards in all graveyards.\nWhenever Coram attacks, each player mills a card.\nDuring each of your turns, you may play a land and cast a spell from among cards in graveyards that were put there from libraries this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 1 },
      resolve: null,
      text: "Whenever Coram attacks, each player mills a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        aggregate: { aggregate: "max", of: "power", filter: { type: "creature" }, in: "graveyards" },
        pt: [1, 0],
      },
      text: "Coram gets +X/+0, where X is the greatest power among creature cards in all graveyards.",
    },
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        anyGraveyard: true,
        play: true,
        landAndSpell: true,
        yourTurnOnly: true,
        filter: { putIntoGraveyardFromLibraryThisTurn: true },
      },
      text: "During each of your turns, you may play a land and cast a spell from among cards in graveyards that were put there from libraries this turn.",
    },
  ],
});
