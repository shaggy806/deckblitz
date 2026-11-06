import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks, target creature defending player controls gets -3/-0 until end of turn, then create a token that's a copy of this creature.";

export default defineCard({
  name: "Giant Space Amoeba",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Germ"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
          { kind: "create-token-copy", of: "source", count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
