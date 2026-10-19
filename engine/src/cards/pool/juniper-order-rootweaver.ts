import { defineCard } from "../define.js";

// EDHREC rank 29342.

const ETB_TEXT = "When this creature enters, if it was kicked, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Juniper Order Rootweaver",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: `Kicker {G} (You may pay an additional {G} as you cast this spell.)\n${ETB_TEXT}`,
  kicker: { cost: "{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
