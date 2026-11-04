import { defineCard } from "../define.js";

// Fires once per declaration, and stays out even if all but one of the
// attackers leave before it resolves (the ruling). "This combat": it can block
// again in a later combat of the turn.
const TEXT = "Whenever two or more creatures your opponents control attack, this creature can't block this combat.";

export default defineCard({
  name: "Flummoxed Cyclops",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "opponent", atLeast: 2 },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: ["cant-block"], duration: "until-end-of-combat" },
      resolve: null,
      text: TEXT,
    },
  ],
});
