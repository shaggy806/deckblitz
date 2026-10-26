import { defineCard } from "../define.js";

// EDHREC rank 31498. Shoal Serpent's lose-defender on Balefire Liege's trigger.

const TEXT = "Whenever you cast a white spell, this creature loses defender until end of turn.";

export default defineCard({
  name: "Loyal Gyrfalcon",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 3,
  keywords: ["defender", "flying"],
  text: `Defender, flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
