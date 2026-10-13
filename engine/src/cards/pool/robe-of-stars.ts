import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 3046.
//
// Astral Projection phases out the creature the Robe is attached to as the
// ability resolves (`attachedToSource`) — and the Robe with it, indirectly
// (rule 702.26g), so both phase in together, still attached, as that
// creature's controller's next untap step begins. Activated in response to
// the Robe's own equip, the Robe is phased out before the equip resolves and
// doesn't move (the ruling): a phased-out Equipment can't be affected.
const PT = "Equipped creature gets +0/+3.";
const ASTRAL =
  "Astral Projection — {1}{W}: Equipped creature phases out. (Treat it and anything attached to it as though they don't exist until its controller's next turn.)";

export default defineCard({
  name: "Robe of Stars",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PT}\n${ASTRAL}\nEquip {1}`,
  static: [{ affects: { scope: "attached" }, grantPt: [0, 3], text: PT }],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "phase-out", attachedToSource: true },
      resolve: null,
      text: ASTRAL,
    },
    equip("{1}"),
  ],
});
