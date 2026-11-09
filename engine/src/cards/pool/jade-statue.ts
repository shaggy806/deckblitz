import { defineCard } from "../define.js";

const TEXT = "{2}: This artifact becomes a 3/6 Golem artifact creature until end of combat. Activate only during combat.";

export default defineCard({
  name: "Jade Statue",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      condition: { kind: "turn-structure", duringCombat: true },
      effect: {
        kind: "become",
        target: "source",
        power: 3,
        toughness: 6,
        setTypes: ["artifact", "creature"],
        setSubtypes: ["Golem"],
        duration: "until-end-of-combat",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
