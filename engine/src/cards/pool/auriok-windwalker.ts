import { defineCard } from "../define.js";

// EDHREC rank 19709.
//
// Brass Squire's ability, word for word.

const TEXT = "{T}: Attach target Equipment you control to target creature you control.";

export default defineCard({
  name: "Auriok Windwalker",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Equipment" } }, "creature-you-control"],
      effect: { kind: "attach", target: 1, attachment: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
