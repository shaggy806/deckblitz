import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

const ENTERS = "When The Thanos-Copter enters, Vehicles you control become artifact creatures until end of turn.";
const DRAW = "Whenever a Vehicle you control deals combat damage to a player, draw a card.";

export default defineCard({
  name: "The Thanos-Copter",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ENTERS}\n${DRAW}\nCrew 2`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { subtype: "Vehicle", controlledBy: "you" },
        simultaneous: true,
        effect: { kind: "become", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  activated: [crew(2)],
});
