import { defineCard } from "../define.js";

// EDHREC rank 7664.
const TEXT = "Whenever another white creature you control enters, tap target creature an opponent controls.";

export default defineCard({
  name: "Court Street Denizen",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", colors: ["W"] },
        otherOnly: true,
      },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
