import { defineCard } from "../define.js";

// The cost's exiled card is what the token copies (rule 602.2b): the exile is
// paid before anyone can answer. "Except it's a 0/0 Construct artifact in addition
// to its other types and it has …" is all copiable (rule 707.9); "it gains haste
// until end of turn" isn't.
const TOKEN_STATIC = "This token gets +1/+1 for each Construct you control.";
const TEXT =
  `{1}, {T}, Exile a creature card from your graveyard: Create a token that's a copy of the exiled card, except it's a 0/0 Construct artifact in addition to its other types and it has "${TOKEN_STATIC}" It gains haste until end of turn. Activate only as a sorcery.`;

export default defineCard({
  name: "Dollhouse of Horrors",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      sorcerySpeed: true,
      effect: {
        kind: "create-token-copy",
        of: "exiled-as-cost",
        count: 1,
        gainUntilEndOfTurn: ["haste"],
        exceptions: {
          addTypes: ["artifact"],
          addSubtypes: ["Construct"],
          basePt: [0, 0],
          static: [
            {
              affects: { scope: "self" },
              grantPtPerCount: { filter: { subtype: "Construct", controlledBy: "you" }, pt: [1, 1] },
              text: TOKEN_STATIC,
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
