import { defineCard } from "../define.js";

// Rulings:
//   [2020-11-10] The delayed triggered ability will trigger whether Forger's Foundry is still on
//     the battlefield or not.
//   [2020-11-10] When casting an instant or sorcery spell with {X} in its mana cost using the mana
//     added by Forger's Foundry, use the value of X chosen when you cast that spell to determine
//     whether or not the delayed triggered ability triggers.
//   [2020-11-10] The mana added by Forger's Foundry can be spent on anything, not just instant and
//     sorcery spells with mana value 3 or less.
//   [2020-11-10] You choose which spells (if any) to cast as Forger's Foundry's last ability
//     resolves. If you do, you do so as part of the resolution of that ability. You can't wait to
//     cast them later in the turn.
//   [2020-11-10] You cast the spells one at a time as Forger's Foundry's last ability is
//     resolving, choosing modes, targets, and so on. The last spell you cast will be the first one
//     to resolve. Ignore timing restrictions based on the cards' types.
//
// The rider (rule 106.12) marks the spell it was spent on, as it goes on the
// stack with its X chosen (202.3e). "You may exile that spell instead" is an
// optional replacement, asked as the spell resolves (`optional`); a spell
// countered or fizzling goes to the graveyard as usual. Exiled "with this
// artifact" (rule 607.2a, `linked`), for the last ability's free casts.

const WHEN_SPENT =
  "When you spend this mana to cast an instant or sorcery spell with mana value 3 or less, you may exile that spell instead of putting it into its owner's graveyard as it resolves.";
const MANA_TEXT = `{T}: Add {U}. ${WHEN_SPENT}`;
const CAST_TEXT =
  "{3}{U}{U}, {T}: You may cast any number of spells from among cards exiled with this artifact without paying their mana costs. Activate only as a sorcery.";

export default defineCard({
  name: "Forger's Foundry",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${CAST_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        whenSpent: {
          spell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
          effect: { kind: "exile-spell-as-it-resolves", anyOwner: true, linked: true, optional: true },
          text: WHEN_SPENT,
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{3}{U}{U}", tap: true },
      targets: [],
      sorcerySpeed: true,
      effect: { kind: "cast-now", from: "exiled-with-source", repeat: true, free: true },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
