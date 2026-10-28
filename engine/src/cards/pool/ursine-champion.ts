import { defineCard } from "../define.js";

// EDHREC rank 28223.
//
// "Becomes a Bear Berserker" replaces its creature types (`add-types`' `setSubtypes`):
// no longer a Human.

export default defineCard({
  name: "Ursine Champion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 2,
  text: "{5}{G}: This creature gets +3/+3 and becomes a Bear Berserker until end of turn. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "add-types", target: "source", setSubtypes: ["Bear", "Berserker"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{5}{G}: This creature gets +3/+3 and becomes a Bear Berserker until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
