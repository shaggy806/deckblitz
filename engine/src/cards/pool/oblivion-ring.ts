import { defineCard } from "../define.js";

// EDHREC rank 5094. Faceless Butcher's two-trigger linked exile (rule
// 607.2a): if this leaves before the enters trigger resolves, the leaves
// trigger finds nothing and the permanent stays exiled (the ruling).

const ENTER_TEXT = "When this enchantment enters, exile another target nonland permanent.";
const LEAVE_TEXT =
  "When this enchantment leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Oblivion Ring",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "nonland-permanent" }],
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
