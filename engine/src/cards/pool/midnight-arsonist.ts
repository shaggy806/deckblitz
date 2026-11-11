import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, destroy up to X target artifacts without mana abilities, where X is the number of Vampires you control.";

export default defineCard({
  name: "Midnight Arsonist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", filter: { type: "artifact", hasManaAbility: false } },
          max: { countOf: { subtype: "Vampire", controlledBy: "you" } },
        },
      ],
      effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
