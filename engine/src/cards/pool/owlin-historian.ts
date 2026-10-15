import { defineCard } from "../define.js";

// EDHREC rank 23602. Secrets of Strixhaven.
//
// "One or more cards leave your graveyard" fires once per move, however many
// cards left together (the ruling).
const SURVEIL_TEXT = "When this creature enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";
const PUMP_TEXT = "Whenever one or more cards leave your graveyard, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Owlin Historian",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${SURVEIL_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "When this creature enters, surveil 1.",
    },
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
