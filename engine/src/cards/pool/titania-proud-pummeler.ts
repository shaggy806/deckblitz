import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// EDHREC rank 15154.

// Adriana, Captain of the Guard's shape: her own melee, and the same melee
// trigger granted to each other creature (each instance triggers on its own,
// rule 702.121b).
const MELEE_TEXT =
  "Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)";
const GRANT_TEXT = "Other creatures you control have melee.";

export default defineCard({
  name: "Titania, Proud Pummeler",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${MELEE_TEXT}\n${GRANT_TEXT}`,
  triggered: [melee()],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantsTriggered: [melee()],
      text: GRANT_TEXT,
    },
  ],
});
