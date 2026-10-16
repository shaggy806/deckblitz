import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// Each token copy enters too, so each draws its own card.
const SQUAD_TEXT =
  "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const DRAW_TEXT = "Benediction of the Omnissiah — When this creature enters, draw a card.";

export default defineCard({
  name: "Sicarian Infiltrator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  keywords: ["flash"],
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: `Flash\n${SQUAD_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    squadTrigger(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
