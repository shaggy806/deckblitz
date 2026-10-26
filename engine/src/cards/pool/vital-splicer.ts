import { defineCard } from "../define.js";

// EDHREC rank 12621.

export default defineCard({
  name: "Vital Splicer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create a 3/3 colorless Phyrexian Golem artifact creature token.\n{1}: Regenerate target Golem you control.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Golem", controlledBy: "you" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{1}: Regenerate target Golem you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 3/3 colorless Phyrexian Golem artifact creature token.",
    },
  ],
});
