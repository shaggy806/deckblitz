import { defineCard } from "../define.js";

// Top-1000 commander #745. EDHREC rank 15417.
//
// The cast trigger resolves before the spell (rule 603.3), so the Doctor
// cards it puts into the graveyard are there, put there from the library
// this turn, as the Fourteenth Doctor is about to enter (rule 614.12). Its
// "If you do, it gains haste until end of turn" is an additional effect of
// copying (rule 707.9e — `copyOnEnter.gainsHaste`), only if it copies.

const CAST_TEXT =
  "When you cast this spell, reveal the top fourteen cards of your library. Put all Doctor cards revealed this way into your graveyard and the rest on the bottom of your library in a random order.";
const COPY_TEXT =
  "You may have The Fourteenth Doctor enter as a copy of a Doctor card in your graveyard that was put there from your library this turn. If you do, it gains haste until end of turn.";

export default defineCard({
  name: "The Fourteenth Doctor",
  manaCost: "{R/G}{W}{U}",
  colors: ["W", "U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 3,
  toughness: 4,
  text: `${CAST_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 14,
        reveal: true,
        min: 14,
        max: 14,
        filter: { subtype: "Doctor" },
        destination: "graveyard",
        leftover: "bottom-random",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  copyOnEnter: {
    filter: { subtype: "Doctor", ownedBy: "you", putIntoGraveyardThisTurn: { from: ["library"] } },
    from: "graveyards",
    gainsHaste: true,
  },
});
