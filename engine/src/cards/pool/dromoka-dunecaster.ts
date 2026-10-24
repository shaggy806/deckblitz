import { defineCard } from "../define.js";

const TAP_TEXT = "{1}{W}, {T}: Tap target creature without flying.";

export default defineCard({
  name: "Dromoka Dunecaster",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 2,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
