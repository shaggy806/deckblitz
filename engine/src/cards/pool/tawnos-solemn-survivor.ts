import { defineCard } from "../define.js";

// EDHREC rank 15659.
//
// The second ability's two artifact tokens are sacrificed, then the card is
// exiled from the graveyard (one cost asks one thing at a time; rule 601.2h
// lets them be paid in any order) and copied as `{ paid: "exiled" }`.
const COPY_TEXT = "{2}, {T}: Create a token that's a copy of up to one target artifact token you control. Mill two cards.";
const EXILE_TEXT =
  "{1}{W}{U}{B}, {T}, Sacrifice two artifact tokens, Exile an artifact or creature card from your graveyard: Create a token that's a copy of the exiled card, except it's an artifact in addition to its other types. Activate only as a sorcery.";

export default defineCard({
  name: "Tawnos, Solemn Survivor",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 3,
  text: `${COPY_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "artifact", token: true, controlledBy: "you" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token-copy", of: 0, count: 1 },
          { kind: "mill", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
    {
      cost: {
        mana: "{1}{W}{U}{B}",
        tap: true,
        sacrifice: { filter: { type: "artifact", token: true }, count: 2 },
        exileFromGraveyard: { count: 1, filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: [],
      effect: { kind: "create-token-copy", of: { paid: "exiled" }, count: 1, exceptions: { addTypes: ["artifact"] } },
      resolve: null,
      text: EXILE_TEXT,
      sorcerySpeed: true,
    },
  ],
});
