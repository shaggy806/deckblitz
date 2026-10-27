import { defineCard } from "../define.js";

export default defineCard({
  name: "Karn's Touch",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target noncreature artifact becomes an artifact creature with power and toughness each equal to its mana value until end of turn. (It retains its abilities.)",
  targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
  effect: {
    kind: "animate",
    target: 0,
    power: { manaValueOf: 0 },
    toughness: { manaValueOf: 0 },
    addTypes: ["artifact", "creature"],
    addSubtypes: [],
    duration: "end-of-turn",
  },
});
