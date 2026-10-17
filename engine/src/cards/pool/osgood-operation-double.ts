import { defineCard } from "../define.js";

// EDHREC rank 13391.
//
// Rulings:
//   [2023-10-13] A triggered ability that triggers when a spell is cast from anywhere other than
//     your hand, such as that of The Thirteenth Doctor, functions only on the battlefield, so it
//     doesn't trigger when you cast that spell from a zone other than your hand.
//   [2023-10-13] If a spell or ability allows you to copy a spell on the stack but doesn't specify
//     that the spell is cast, that spell wasn't cast and won't be counted by paradox abilities.
//   [2023-10-13] Paradox abilities count any spells cast from zones other than your hand. These
//     are usually spells cast from exile, the graveyard, or the command zone.
//
// "When you cast this spell" is a `this-cast` trigger on the spell; its token
// is a copy of the spell (`of: "source"`, read as it last existed if it has
// left the stack — rule 608.2h) minus legendary, under the caster. The mana
// is Dalakos, Crafter of Wonders' restriction: "an ability of an artifact"
// is an artifact permanent's (rule 109.2), so no `abilityOfAnyZone`.
const CAST_TEXT = "When you cast this spell, create a token that's a copy of it, except it isn't legendary.";
const MANA_TEXT = "{T}: Add {C}. Spend this mana only to cast an artifact spell or activate an ability of an artifact.";
const PARADOX_TEXT =
  "Paradox — Whenever you cast a spell from anywhere other than your hand, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Osgood, Operation Double",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Alien", "Shapeshifter"],
  power: 2,
  toughness: 2,
  text: `${CAST_TEXT}\n${MANA_TEXT}\n${PARADOX_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: { type: "artifact" },
          text: "Spend this mana only to cast an artifact spell or activate an ability of an artifact.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, notLegendary: true, who: "you" },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: PARADOX_TEXT,
    },
  ],
});
