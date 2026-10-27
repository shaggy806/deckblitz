import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 12563.

const RETURN_TEXT =
  "{T}: Return target noncreature artifact card with mana value 1 or less from your graveyard to the battlefield.";
const UNTAP_TEXT = "Whenever a creature dies, you may untap this artifact.";

export default defineCard({
  name: "Salvaging Station",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${RETURN_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "artifact", notTypes: ["creature"], manaValue: { op: "lte", n: 1 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Untap Salvaging Station?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
