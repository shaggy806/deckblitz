import { defineCard } from "../define.js";

// Rulings: nothing moves until the trigger resolves, and nothing moves if this
// creature has left by then; an Aura or Equipment that can't legally be
// attached to it isn't (the attach's own legality check, rule 701.3).

const ETB_TEXT = "When this creature enters, you may attach any number of Auras and Equipment you control to it.";
const ANTHEM_TEXT = "Other creatures you control get +1/+1 for each Aura and Equipment attached to this creature.";

export default defineCard({
  name: "Heavenly Blademaster",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 6,
  keywords: ["flying", "double-strike"],
  text: `Flying, double strike\n${ETB_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "attach",
        target: "source",
        choose: {
          filter: { subtypes: ["Aura", "Equipment"], controlledBy: "you" },
          prompt: "Attach any number of Auras and Equipment you control to Heavenly Blademaster",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      grantPtPerCount: { filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } }, pt: [1, 1] },
      text: ANTHEM_TEXT,
    },
  ],
});
