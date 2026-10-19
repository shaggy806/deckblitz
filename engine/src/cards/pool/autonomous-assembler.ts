import { defineCard } from "../define.js";

// EDHREC rank 25127. Brothers' War. Prototype (rule 718) is `prototype`, as
// Combat Thresher: cast for {1}{W} it's a white 2/2 on the stack and the
// battlefield, a colorless 4/5 everywhere else.
const PUMP_TEXT = "{1}, {T}: Put a +1/+1 counter on target Assembly-Worker you control.";

export default defineCard({
  name: "Autonomous Assembler",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance"],
  text:
    "Prototype {1}{W} — 2/2 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\n" +
    `Vigilance\n${PUMP_TEXT}`,
  prototype: { cost: "{1}{W}", power: 2, toughness: 2 },
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Assembly-Worker" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
