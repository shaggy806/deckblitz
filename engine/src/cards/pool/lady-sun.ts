import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

const TEXT =
  "{T}: Return Lady Sun and another target creature to their owners' hands. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Lady Sun",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
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
