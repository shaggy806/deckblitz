import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may sacrifice an artifact or creature. When you do, exile target creature an opponent controls.";

export default defineCard({
  name: "Undercity Eliminator",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon", "Assassin"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      // "When you do" is a reflexive ability (rule 603.12): its target is
      // chosen once the sacrifice is made (the ruling). Any artifact or
      // creature — this one included.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { typesAnyOf: ["artifact", "creature"] }, text: "Sacrifice an artifact or creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "exile", target: 0 },
          text: "When you do, exile target creature an opponent controls.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
