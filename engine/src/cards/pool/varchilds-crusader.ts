import { defineCard } from "../define.js";

const ABILITY_TEXT = "{0}: This creature can't be blocked this turn except by Walls. Sacrifice this creature at the beginning of the next end step.";

export default defineCard({
  name: "Varchild's Crusader",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: "source", restrictions: [{ kind: "cant-be-blocked", by: { notSubtypes: ["Wall"] } }] },
          { kind: "delayed-trigger", at: { step: "end" }, effect: { kind: "sacrifice-source" }, text: "Sacrifice this creature at the beginning of the next end step." },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
