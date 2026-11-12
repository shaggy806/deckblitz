import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect): each Stab Wound is a new card you own, entering under your control
// attached to that creature (`for-each-permanent` binds each in turn).
const ENTER_TEXT =
  "When Perforator Crocodile enters, for each creature your opponents control, conjure a card named Stab Wound onto the battlefield attached to that creature.";

export default defineCard({
  name: "Perforator Crocodile",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 6,
  toughness: 5,
  cycling: { cost: "{1}{B}" },
  text: `${ENTER_TEXT}\nCycling {1}{B}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "opponent" },
        effect: { kind: "conjure", name: "Stab Wound", to: "battlefield", attachedTo: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
