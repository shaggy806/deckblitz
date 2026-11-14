import { defineCard } from "../define.js";

// Two cards or none (its ruling: "You can't choose to exile just one"), from
// any graveyards; its controller chooses which it copies, and the other's
// power is its +1/+1 counters (the rulings). The copied card's own "as this
// enters" and "enters with" abilities apply as it enters (its first ruling).
// Declining, it's a 0/0.
export default defineCard({
  name: "The Mimeoplasm",
  manaCost: "{2}{B}{G}{U}",
  colors: ["B", "G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text:
    "As The Mimeoplasm enters, you may exile two creature cards from graveyards. If you do, it enters as a copy of " +
    "one of those cards with a number of additional +1/+1 counters on it equal to the power of the other card.",
  copyOnEnter: {
    filter: { type: "creature" },
    from: "graveyards",
    exileFirst: 2,
    counters: [{ kind: "+1/+1", amount: "other-exiled-power" }],
  },
});
