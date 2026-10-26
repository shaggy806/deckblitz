import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

const TEXT =
  "Whenever this creature attacks, you may have it deal 1 damage to each creature defending player controls.";

export default defineCard({
  name: "Ronin Cliffrider",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 2,
  text: `Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${TEXT}`,
  triggered: [
    ...bushido(1),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Ronin Cliffrider deal 1 damage to each creature defending player controls?",
        effect: { kind: "damage-all", filter: { type: "creature" }, amount: 1, whose: "trigger-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
