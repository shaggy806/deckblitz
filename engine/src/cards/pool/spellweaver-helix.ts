import { defineCard } from "../define.js";

// EDHREC rank 11556. Imprint links the two abilities (rule 607.2a). "Casts a
// card" is never a copy (Eye of the Storm's `isCopy: false`), so a copy cast
// this way can't trigger it again. "If it has the same name as one of the
// cards exiled with this artifact" is an intervening "if" (rule 603.4), asked
// again as the ability resolves: the matching card gone from exile by then,
// nothing happens. "The other" is the exiled cards less one with that name
// (`exceptOneMatching`): with the other gone, or only one card imprinted,
// there is nothing to copy; two of the same name make one copy (the
// rulings). A copy not cast ceases to exist (rule 704.5e), so declining to
// copy and declining to cast are the same.
//
// Rulings:
//   [2004-10-04] If this card leaves the battlefield while the ability to make a copy is on the
//     stack, the ability will still make a copy using the last-known-information rule.
//   [2004-10-04] If the imprinted card leaves the exile zone while the ability to make a copy is
//     on the stack, then no copy will be made.
//   [2004-12-01] You cast the copy while this ability is resolving, and still on the stack.
//     Normally, you’re not allowed to cast spells or activate abilities at this time. Spellweaver
//     Helix’s ability breaks this rule. (The card that triggered this ability is also still on the
//     stack.)
//   [2004-12-01] If the two imprinted sorcery cards have the same name and a card with that name
//     is cast, only one copy is created, not two.
//   [2004-12-01] If you don’t want to cast the copy, you can choose not to; the copy ceases to
//     exist the next time state-based actions are checked.
//   [2004-12-01] If there’s only one imprinted sorcery card, nothing happens.
//   [2004-12-01] You don’t pay the spell’s mana cost. If a spell has X in its mana cost, X is 0.
//     You do pay any additional costs for that spell. You can’t use any alternative costs.
//   [2004-12-01] You can’t cast the copy if an effect prevents you from casting sorceries or from
//     casting that particular sorcery.
//   [2004-12-01] You can’t cast the copy unless all of its targets can be chosen.
//   [2004-12-01] Spellweaver Helix’s second ability creates a copy of the imprinted card in the
//     Exile zone (that’s where the imprinted sorcery card is), then allows you to cast it without
//     paying its mana cost.
//   [2005-03-01] The creation of the copy and then the casting of the copy are both optional.
//   [2017-04-18] A split card has the same name as a spell if either of its names is that spell’s
//     name.

const IMPRINT_TEXT =
  "Imprint — When this artifact enters, you may exile two target sorcery cards from a single graveyard.";
const COPY_TEXT =
  "Whenever a player casts a card, if it has the same name as one of the cards exiled with this artifact, you may copy the other. If you do, you may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Spellweaver Helix",
  manaCost: "{3}",
  types: ["artifact"],
  text: `${IMPRINT_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "any", filter: { type: "sorcery" } },
          min: 2,
          max: 2,
          sameController: true,
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exile two target sorcery cards from a single graveyard?",
        effect: {
          kind: "for-each-target",
          from: 0,
          simultaneous: true,
          effect: { kind: "exile", target: 0, linked: true },
        },
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "any", filter: { isCopy: false } },
      condition: { kind: "trigger-object", filter: { sameNameWith: "exiled-with-source" } },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "exiled-with-source",
        exceptOneMatching: { sameNameWith: "trigger-object" },
        copies: 1,
        free: true,
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
