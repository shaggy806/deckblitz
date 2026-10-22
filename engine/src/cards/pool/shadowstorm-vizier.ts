import { defineCard } from "../define.js";

// EDHREC rank 25819. Amonkhet. Grisly Survivor's trigger: cycling is a
// discard, so a cycled card fires it once (the ruling).
const TRIGGER = "Whenever you cycle or discard a card, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Shadowstorm Vizier",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
