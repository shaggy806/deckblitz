import { defineCard } from "../define.js";

export default defineCard({
  name: "Corridor Monitor",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 4,
  text: "When this creature enters, untap target artifact or creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "When this creature enters, untap target artifact or creature you control.",
    },
  ],
});
