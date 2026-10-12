import { defineCard } from "../define.js";

export default defineCard({
  name: "Vildin-Pack Outcast",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\n{R}: This creature gets +1/-1 until end of turn.\n{5}{R}{R}: Transform this creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/-1 until end of turn.",
    },
    {
      cost: { mana: "{5}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{R}{R}: Transform this creature.",
    },
  ],
  faces: ["Vildin-Pack Outcast", "Dronepack Kindred"],
  transform: true,
});
