import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever Sovereign Okinec Ahau attacks, for each creature you control with power greater than that " +
  "creature's base power, put a number of +1/+1 counters on that creature equal to the difference.";

export default defineCard({
  name: "Sovereign Okinec Ahau",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Noble"],
  power: 3,
  toughness: 4,
  text: `Ward {2}\n${ATTACK_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // Every difference is read before any counter goes on (`addCounterAll`).
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", power: { op: "gt", n: { own: "basePower" } } },
        counter: "+1/+1",
        amount: "own-power-over-base-power",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
