import { defineCard } from "../define.js";

// EDHREC rank 21359. Donatello's intervening-if (rule 603.4), on an Equipment.

const ENTERS = "When this creature enters, if you control an Equipment, draw a card.";

export default defineCard({
  name: "Settlement Blacksmith",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Equipment" }, atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
