import { defineCard } from "../define.js";

// EDHREC rank 29417. Amonkhet. Untapping an attacker doesn't remove it from
// combat (the ruling).

const UNTAP_TEXT = "{1}{W}: Untap target creature. Activate only if you control a Gideon planeswalker.";

export default defineCard({
  name: "Companion of the Trials",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Gideon" }, atLeast: 1 },
      targets: ["creature"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
