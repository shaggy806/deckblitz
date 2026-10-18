import { defineCard } from "../define.js";

// EDHREC rank 15740.
//
// Misleading Motes's owner's choice of top or bottom, on an optional "other"
// target (no target chosen, nothing happens). The empower trigger is Valeria
// Richards's "first noncreature spell each turn", which counts every
// noncreature spell its controller cast this turn — this enchantment's own
// cast included, so it doesn't trigger the turn it's cast (the ruling).
const ETB_TEXT =
  "When this enchantment enters, the owner of up to one other target nonland permanent puts it on their choice of the top or bottom of their library.";
const EMPOWER_TEXT = "Whenever you cast your first noncreature spell each turn, empower Jace 1.";

export default defineCard({
  name: "Plan for All Outcomes",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${EMPOWER_TEXT} (Put a loyalty counter on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with "[−1]: Surveil 1" and "[−3]: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "empower-jace", amount: 1 },
      resolve: null,
      text: EMPOWER_TEXT,
    },
  ],
});
