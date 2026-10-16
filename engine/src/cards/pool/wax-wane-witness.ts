import { defineCard } from "../define.js";

// EDHREC rank 13788. "Whenever you gain or lose life during your turn" is one
// trigger condition over two kinds of event, so it's two triggers here — a
// life gain and a life loss, each once per event (the rulings: a "for each"
// gain is one event; two lifelinkers are two), each only during your turn.
// "During your turn" is part of the trigger condition (rule 603.1), not an
// intervening "if": `whileCondition`, checked as the event happens.
const TEXT = "Whenever you gain or lose life during your turn, this creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Wax-Wane Witness",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bat", "Cleric"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "loses-life", who: "you" },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
