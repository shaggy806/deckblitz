import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

const TREASURE = "Whenever this Vehicle deals combat damage to a player, create a Treasure token for each artifact they control.";

export default defineCard({
  name: "Hoard Hauler",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TREASURE}\n${crewText(3)}`,
  activated: [crew(3, crewText(3))],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { countOf: { type: "artifact", controlledBy: "you" }, forPlayer: "trigger-player" },
      },
      resolve: null,
      text: TREASURE,
    },
  ],
});
