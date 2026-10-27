import { defineCard } from "../define.js";

// Torment. EDHREC rank 17151. Journey to Nowhere's two-trigger exile (rule
// 607.2a): if this leaves before the enters trigger resolves, the leaves
// trigger finds nothing and the creature stays exiled. A token exiled ceases
// to exist and never returns (the rulings). The enters trigger isn't
// optional: with no other creature but yours, one of yours is the target.

const ENTER_TEXT = "When this creature enters, exile another target creature.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Faceless Butcher",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
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
