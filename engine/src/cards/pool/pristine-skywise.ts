import { defineCard } from "../define.js";

// EDHREC rank 23012.
const TEXT =
  "Whenever you cast a noncreature spell, untap this creature. It gains protection from the color of your choice until end of turn.";

export default defineCard({
  name: "Pristine Skywise",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "grant-protection", target: "source", from: { choose: "color" }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
