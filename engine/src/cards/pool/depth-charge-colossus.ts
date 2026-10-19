import { defineCard } from "../define.js";

// The Brothers' War. Prototype (rule 718): cast for {4}{U}{U} it's a blue 6/6
// on the stack and the battlefield, a colorless 9/9 everywhere else.
const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const UNTAP_TEXT = "{3}: Untap this creature.";

export default defineCard({
  name: "Depth Charge Colossus",
  manaCost: "{9}",
  types: ["artifact", "creature"],
  subtypes: ["Dreadnought"],
  power: 9,
  toughness: 9,
  text:
    "Prototype {4}{U}{U} — 6/6 (You may cast this spell with different mana cost, color, and size. " +
    `It keeps its abilities and types.)\n${UNTAP_STEP_TEXT}\n${UNTAP_TEXT}`,
  prototype: { cost: "{4}{U}{U}", power: 6, toughness: 6 },
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
