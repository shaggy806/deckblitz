import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 25872. "Cycle or discard" is one trigger per card
// discarded — cycling is a discard (its ruling).

const TRIGGER = "Whenever you cycle or discard a card, target creature gains flying until end of turn.";

export default defineCard({
  name: "Zenith Seeker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
