import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 7038.
const ATTACK_TEXT =
  'Whenever one or more Vehicles you control attack, create a 1/1 colorless Pilot creature token with "This token crews Vehicles as though its power were 2 greater."';

export default defineCard({
  name: "Prodigy's Prototype",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${crewText(2)}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtype: "Vehicle" } },
      targets: [],
      effect: { kind: "create-token", token: "Pilot Token (Crews Vehicles)", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [crew(2)],
});
