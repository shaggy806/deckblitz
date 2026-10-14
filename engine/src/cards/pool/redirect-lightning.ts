import { defineCard } from "../define.js";

// See Bolt Bend for "change the target of target spell or ability with a
// single target" (rule 115.7a).
export default defineCard({
  name: "Redirect Lightning",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text:
    "As an additional cost to cast this spell, pay 5 life or pay {2}.\n" +
    "Change the target of target spell or ability with a single target.",
  additionalCost: {
    options: [
      { text: "Pay 5 life", payLife: 5 },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  targets: [{ kind: "stack", spells: "any", abilities: true, singleTarget: true }],
  effect: { kind: "change-targets", target: 0, how: "change" },
});
