import { defineCard } from "../define.js";

export default defineCard({
  name: "Tarkir Duneshaper",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog", "Warrior"],
  power: 1,
  toughness: 2,
  text: "{4}{G/P}: Transform this creature. Activate only as a sorcery. ({G/P} can be paid with either {G} or 2 life.)",
  activated: [
    {
      cost: { mana: "{4}{G/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}{G/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Tarkir Duneshaper", "Burnished Dunestomper"],
  transform: true,
});
