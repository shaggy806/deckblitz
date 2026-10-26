import { defineCard } from "../define.js";

// Betrayers of Kamigawa. EDHREC rank 30704.

const TEXT = "Whenever you cast a Spirit or Arcane spell, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Scaled Hulk",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
