import { defineCard } from "../define.js";

// EDHREC rank 21461.

const ETB_TEXT = "When this creature enters, another target creature or Vehicle you control gets +2/+2 until end of turn.";

export default defineCard({
  name: "Fang Guardian",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape", "Druid"],
  power: 4,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
        },
      ],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
