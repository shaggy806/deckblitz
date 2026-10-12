import { defineCard } from "../define.js";

export default defineCard({
  name: "Blight Grenade",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature.\nAll creatures get -3/-3 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -3,
        toughness: -3,
        duration: "end-of-turn",
      },
    ],
  },
});
