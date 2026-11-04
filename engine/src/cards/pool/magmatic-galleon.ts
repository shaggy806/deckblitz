import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

const ENTERS = "When this Vehicle enters, it deals 5 damage to target creature an opponent controls.";
const EXCESS = "Whenever one or more creatures your opponents control are dealt excess noncombat damage, create a Treasure token.";

export default defineCard({
  name: "Magmatic Galleon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: `${ENTERS}\n${EXCESS}\n${crewText(2)}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: {
        on: "dealt-damage",
        who: "opponent",
        filter: { type: "creature" },
        combat: false,
        excess: true,
        batched: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: EXCESS,
    },
  ],
  activated: [crew(2, crewText(2))],
});
