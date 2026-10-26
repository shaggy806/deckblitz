import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// Portal Second Age (P02). EDHREC rank 31124. Both return at once (Contempt's
// simultaneous pair). With its one target gone illegal the ability doesn't
// resolve (rule 608.2b), so the Wizard stays.
//
// Rulings:
//   [2013-09-20] If a turn has multiple combat phases, the ability can only be activated before
//     the beginning of the declare attackers step of the first combat phase in that turn.

const TEXT =
  "{T}: Return this creature and another target creature to their owners' hands. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Coastal Wizard",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: "source" },
          { kind: "return-to-hand", target: 0 },
        ],
      },
      resolve: null,
      condition: BEFORE_ATTACKERS_DECLARED,
      text: TEXT,
    },
  ],
});
