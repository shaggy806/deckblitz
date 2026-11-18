import { defineCard } from "../define.js";

// EDHREC rank 17251.
//
// Rulings:
//   [2017-11-17] If Day of the Dragons leaves the battlefield before its first ability has
//     resolved, its second ability will trigger and you'll sacrifice any Dragons you already
//     control. Then its first ability will resolve and exile your creatures forever, leaving you
//     with that many Dragon tokens.
//   [2017-11-17] Token creatures will count to determine how many Dragon tokens you create, but
//     they won't be returned to the battlefield when Day of the Dragons leaves the battlefield.
//   [2017-11-17] Auras attached to the exiled creatures will be put into their owners'
//     graveyards. Equipment attached to the exiled creatures will become unattached and remain on
//     the battlefield. Any counters on the exiled creatures will cease to exist.
//   [2017-11-17] All of the nontoken creatures you exiled return to the battlefield when Day of
//     the Dragons leaves the battlefield, even if some or all of the Dragon tokens had already
//     left the battlefield.
//
// Two linked abilities (rule 607.2a), as Worldgorger Dragon's: the exile is
// "with this" stint (`exile-all`'s `linked`), a token counting toward "that
// many" (`thisWay: "exiled"`), and the leaves trigger returns those cards
// together under the effect's controller (`under: "you"`, rule 110.2a). If it
// leaves before the enters trigger resolves, the return comes first and finds
// nothing; the exile then links to a stint that's gone, so the creatures stay
// exiled for good.
const ENTER_TEXT =
  "When this enchantment enters, exile all creatures you control. Then create that many 5/5 red Dragon creature tokens with flying.";
const LEAVE_TEXT =
  "When this enchantment leaves the battlefield, sacrifice all Dragons you control. Then return the exiled cards to the battlefield under your control.";

export default defineCard({
  name: "Day of the Dragons",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-all", filter: { type: "creature", controlledBy: "you" }, linked: true },
          { kind: "create-token", token: "Dragon Token", count: { thisWay: "exiled" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-all", who: "you", filter: { subtype: "Dragon" } },
          { kind: "return-exiled-by-source", linked: "battlefield", under: "you" },
        ],
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
