import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 11936.
const ATTACK_TEXT =
  "Whenever this Vehicle attacks, return target creature or Vehicle card with mana value 2 or less from your graveyard to your hand.";

export default defineCard({
  name: "Imperial Recovery Unit",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            anyOf: [{ type: "creature" }, { subtype: "Vehicle" }],
            manaValue: { op: "lte", n: 2 },
          },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
