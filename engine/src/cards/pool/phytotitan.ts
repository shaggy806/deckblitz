import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, return it to the battlefield tapped under its owner's control at the beginning of their next upkeep.";

export default defineCard({
  name: "Phytotitan",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 7,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "upkeep", whose: { ownerOf: "trigger-object" } },
        effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
        text: "Return it to the battlefield tapped under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
