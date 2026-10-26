import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 19946.
const HUMAN = "Whenever another Human you control enters, untap this creature.";
const TAP = "{1}{U}, {T}: You may tap or untap target permanent.";

export default defineCard({
  name: "Captain of the Mists",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${HUMAN}\n${TAP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Human" }, otherOnly: true },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: HUMAN,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: ["permanent"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target permanent.", effect: { kind: "tap", target: 0 } },
          { text: "Untap target permanent.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TAP,
    },
  ],
});
