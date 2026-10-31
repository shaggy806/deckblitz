import { defineCard } from "../define.js";

// Commander 2017 (C17). EDHREC rank 14525. Draconic Roar's optional Dragon
// reveal (`keyword: "reveal"`, `orControls`) on a creature: the permanent
// remembers its spell was kicked, which the enters trigger's intervening
// "if" reads (rule 603.4).

const DRAW_TEXT =
  "When this creature enters, if you revealed a Dragon card or controlled a Dragon as you cast this spell, draw a card.";

export default defineCard({
  name: "Orator of Ojutai",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Monk"],
  power: 0,
  toughness: 4,
  keywords: ["defender", "flying"],
  kicker: {
    cost: "",
    keyword: "reveal",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true },
    orControls: { subtype: "Dragon" },
  },
  text: `As an additional cost to cast this spell, you may reveal a Dragon card from your hand.\nDefender, flying\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
