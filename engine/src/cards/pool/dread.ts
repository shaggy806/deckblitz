import { defineCard } from "../define.js";

const DAMAGE_TEXT = "Whenever a creature deals damage to you, destroy it.";
const SHUFFLE_TEXT = "When Dread is put into a graveyard from anywhere, shuffle it into its owner's library.";

export default defineCard({
  name: "Dread",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 6,
  toughness: 6,
  keywords: ["fear"],
  text: `Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n${DAMAGE_TEXT}\n${SHUFFLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "you" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
