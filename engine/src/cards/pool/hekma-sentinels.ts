import { defineCard } from "../define.js";

// Amonkhet. Grisly Survivor's per-card discard trigger.
const TEXT = "Whenever you cycle or discard a card, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Hekma Sentinels",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
