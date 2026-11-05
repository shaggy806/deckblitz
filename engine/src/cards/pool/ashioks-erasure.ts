import { defineCard } from "../define.js";

// The exiled spell is linked to this enchantment (rule 607.2a): it names what
// opponents can't cast, and goes to its owner's hand as this leaves. Gone
// before the enters ability resolves, the leave trigger finds nothing and the
// spell stays exiled for good (the ruling).
const EXILE = "When this enchantment enters, exile target spell.";
const LOCK = "Your opponents can't cast spells with the same name as the exiled card.";
const RETURN = "When this enchantment leaves the battlefield, return the exiled card to its owner's hand.";

export default defineCard({
  name: "Ashiok's Erasure",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${EXILE}\n${LOCK}\n${RETURN}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["spell"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: RETURN,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "opponents", spells: { sameNameWith: "exiled-with-source" } },
      text: LOCK,
    },
  ],
});
