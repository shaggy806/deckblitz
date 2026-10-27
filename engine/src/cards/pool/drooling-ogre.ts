import { defineCard } from "../define.js";

// EDHREC rank 22583. "That player" is the artifact spell's caster.

export default defineCard({
  name: "Drooling Ogre",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 3,
  text: "Whenever a player casts an artifact spell, that player gains control of this creature. (This effect lasts indefinitely.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "gain-control", target: "source", who: "trigger-controller", untilEndOfTurn: false },
      resolve: null,
      text: "Whenever a player casts an artifact spell, that player gains control of this creature.",
    },
  ],
});
