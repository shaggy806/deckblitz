import { defineCard } from "../define.js";

const ETB_TEXT = "When Flash Thompson enters, choose one or both —";
const HECKLE_TEXT = "• Heckle — Tap target creature.";
const WORSHIP_TEXT = "• Hero Worship — Untap target creature.";

export default defineCard({
  name: "Flash Thompson, Spider-Fan",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}\n${HECKLE_TEXT}\n${WORSHIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // The modes are chosen as it's put on the stack, each with its own
      // target, and happen in printed order: the same creature chosen for
      // both is tapped, then untapped (the ruling).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 2,
        modes: [
          { text: HECKLE_TEXT, targets: ["creature"], effect: { kind: "tap", target: 0 } },
          { text: WORSHIP_TEXT, targets: ["creature"], effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${HECKLE_TEXT} ${WORSHIP_TEXT}`,
    },
  ],
});
