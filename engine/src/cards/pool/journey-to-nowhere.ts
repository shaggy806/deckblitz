import { defineCard } from "../define.js";

// EDHREC rank 8818.
//
// The old two-trigger wording, as Leonin Relic-Warder: the creature is exiled
// linked to this enchantment (rule 607.2a) and the leaves trigger returns it.
// Its ruling: if this leaves before the enters trigger resolves, the leaves
// trigger finds nothing, and the creature is exiled for good.
const ENTER_TEXT = "When this enchantment enters, exile target creature.";
const LEAVE_TEXT =
  "When this enchantment leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Journey to Nowhere",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
