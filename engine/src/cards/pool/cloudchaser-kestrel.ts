import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, destroy target enchantment.";
const COLOR_TEXT = "{W}: Target permanent becomes white until end of turn.";

export default defineCard({
  name: "Cloudchaser Kestrel",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${COLOR_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: ["permanent"],
      effect: { kind: "become-color", target: 0, colors: ["W"], duration: "end-of-turn" },
      resolve: null,
      text: COLOR_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
