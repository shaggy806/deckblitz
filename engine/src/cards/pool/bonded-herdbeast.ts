import { defineCard } from "../define.js";

export default defineCard({
  name: "Bonded Herdbeast",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  text: "{4}{R/P}: Transform this creature. Activate only as a sorcery. ({R/P} can be paid with either {R} or 2 life.)",
  activated: [
    {
      cost: { mana: "{4}{R/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}{R/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Bonded Herdbeast", "Plated Kilnbeast"],
  transform: true,
});
