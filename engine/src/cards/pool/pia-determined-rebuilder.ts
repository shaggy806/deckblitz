import { defineCard } from "../define.js";

// EDHREC rank 25604.

export default defineCard({
  name: "Pia, Determined Rebuilder",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: "When Pia enters, create a 1/1 colorless Thopter artifact creature token with flying.\n{5}{R}: Target creature gets +X/+0 until end of turn, where X is the number of artifacts you control.",
  activated: [
    {
      cost: { mana: "{5}{R}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { countOf: { type: "artifact", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{5}{R}: Target creature gets +X/+0 until end of turn, where X is the number of artifacts you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: "When Pia enters, create a 1/1 colorless Thopter artifact creature token with flying.",
    },
  ],
});
