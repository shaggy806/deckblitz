import { defineCard } from "../define.js";

// EDHREC rank 18575. Coldsnap. Captain of the Mists' "you may tap or untap".

export default defineCard({
  name: "Rimewind Taskmage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{1}, {T}: You may tap or untap target permanent. Activate only if you control four or more snow permanents.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 4 },
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
      text: "{1}, {T}: You may tap or untap target permanent. Activate only if you control four or more snow permanents.",
    },
  ],
});
