import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast an instant or sorcery spell, this creature gets +X/+0 until end of turn, where X is that spell's mana value.";

// The spell's mana value counts its chosen X (the ruling): the trigger
// object is the spell on the stack.
export default defineCard({
  name: "Erratic Cyclops",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Shaman"],
  power: 0,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaValueOf: "trigger-object" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
