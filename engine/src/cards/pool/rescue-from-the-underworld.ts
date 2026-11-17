import { defineCard } from "../define.js";

// EDHREC rank 12625.
//
// Rulings:
//   [2013-09-15] Rescue from the Underworld is exiled as it resolves, not later as its delayed
//     trigger resolves.
//   [2013-09-15] However, if the sacrificed creature is put into another public zone instead of
//     the graveyard, perhaps because it's your commander or because of another replacement effect,
//     it will return to the battlefield from the zone it went to.
//   [2013-09-15] If either the sacrificed creature or the target creature card leaves the
//     graveyard before the delayed triggered ability resolves during your next upkeep, it won't
//     return.
//   [2013-09-15] Once you announce you're casting Rescue from the Underworld, no player may
//     attempt to stop you from casting the spell by removing the creature you want to sacrifice.
//   [2013-09-15] If you sacrifice a creature token to cast Rescue from the Underworld, it won't
//     return to the battlefield, although the target creature card will.
// "The sacrificed card" is the cost's `{ paid: "sacrificed" }`, remembered in
// the stint it went to as it was sacrificed — the graveyard, or exile under a
// replacement — so one that has left it since, or a token, doesn't return
// (rule 603.7c). A commander under rule 903.9a goes to the graveyard first and
// to the command zone after, a move that ruling (written for the old
// replacement) no longer covers. Both enter at once (rule 603.6a).
const RETURN_TEXT = "Return that card and the sacrificed card to the battlefield under your control.";

export default defineCard({
  name: "Rescue from the Underworld",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nChoose target creature card in your graveyard. Return that card and the sacrificed card to the battlefield under your control at the beginning of your next upkeep. Exile Rescue from the Underworld.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "delayed-trigger",
    at: { step: "upkeep", whose: "you" },
    remember: { sacrificed: { set: { paid: "sacrificed" } } },
    effect: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "put-onto-battlefield", target: 0, underYourControl: true },
        { kind: "put-onto-battlefield", target: { remembered: "sacrificed" }, underYourControl: true },
      ],
    },
    text: RETURN_TEXT,
  },
  exileOnResolve: true,
});
