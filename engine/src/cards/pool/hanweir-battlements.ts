import { defineCard } from "../define.js";

// A meld card (rule 712.4): it and Hanweir Garrison meld into Hanweir, the
// Writhing Township. The activated ability's "if" is checked as it resolves:
// the `meld` effect does nothing unless you both own and control this land
// and a creature named Hanweir Garrison then.
//
// Rulings:
//   [2016-07-13] For more information on meld cards, see the Eldritch Moon mechanics article.
const MELD_TEXT =
  "{3}{R}{R}, {T}: If you both own and control this land and a creature named Hanweir Garrison, exile them, then meld them into Hanweir, the Writhing Township.";

export default defineCard({
  name: "Hanweir Battlements",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n{R}, {T}: Target creature gains haste until end of turn.\n${MELD_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{R}, {T}: Target creature gains haste until end of turn.",
    },
    {
      cost: { mana: "{3}{R}{R}", tap: true },
      targets: [],
      effect: { kind: "meld", partner: { name: "Hanweir Garrison", type: "creature" }, into: "Hanweir, the Writhing Township" },
      resolve: null,
      text: MELD_TEXT,
    },
  ],
});
