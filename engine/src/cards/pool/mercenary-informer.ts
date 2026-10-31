import { defineCard } from "../define.js";

// "Can't be the target of black spells or abilities from black sources" —
// any player's, its own controller's too (no "your opponents control"):
// `hexproofFrom` with `anyController` (rule 601.2c).
const TARGET_TEXT = "This creature can't be the target of black spells or abilities from black sources.";
const BOTTOM_TEXT = "{2}{W}: Put target nontoken Mercenary on the bottom of its owner's library.";

export default defineCard({
  name: "Mercenary Informer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Mercenary"],
  power: 2,
  toughness: 1,
  text: `${TARGET_TEXT}\n${BOTTOM_TEXT}`,
  static: [{ affects: { scope: "self" }, hexproofFrom: { colors: ["B"], anyController: true }, text: TARGET_TEXT }],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Mercenary", token: false } }],
      effect: { kind: "put-on-bottom-of-library", target: 0 },
      resolve: null,
      text: BOTTOM_TEXT,
    },
  ],
});
