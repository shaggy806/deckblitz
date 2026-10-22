import { defineCard } from "../define.js";

// EDHREC rank 19013. Amonkhet. Grisly Survivor's trigger: once per card
// discarded, cycling included (the rulings — a cycle triggers it once).

const TEXT = "Whenever you cycle or discard a card, this creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Flameblade Adept",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 1,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
