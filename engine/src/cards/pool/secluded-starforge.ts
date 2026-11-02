import { defineCard } from "../define.js";

const PUMP_TEXT =
  "{2}, {T}, Tap X untapped artifacts you control: Target creature gets +X/+0 until end of turn. Activate only as a sorcery.";
const ROBOT_TEXT = "{5}, {T}: Create a 2/2 colorless Robot artifact creature token.";

// "Tap X untapped artifacts": X announced as it's activated (rule 107.3a), an
// artifact tapped for the {2} is no longer there to tap for X.
export default defineCard({
  name: "Secluded Starforge",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${PUMP_TEXT}\n${ROBOT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true, tapOthers: { count: "x", filter: { type: "artifact", controlledBy: "you" } } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      resolve: null,
      sorcerySpeed: true,
      text: PUMP_TEXT,
    },
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token", count: 1 },
      resolve: null,
      text: ROBOT_TEXT,
    },
  ],
});
