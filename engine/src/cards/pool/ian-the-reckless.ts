import { defineCard } from "../define.js";

// EDHREC rank 16498. Fallout (PIP).
//
// "If it's modified" is an intervening if (rule 603.4): no trigger unless Ian
// is modified as he attacks, and nothing on resolution unless he still is —
// as he last existed on the battlefield, if he has left (the rulings), whose
// power then sets the damage too. The two damages are one simultaneous event,
// both dealt by Ian. "Any target" is chosen as it triggers; "you may" is
// asked as it resolves.
const TEXT =
  "Whenever Ian the Reckless attacks, if it's modified, you may have it deal damage equal to its power to you and any target.";

export default defineCard({
  name: "Ian the Reckless",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { modified: true } },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Have Ian deal damage equal to his power to you and the target?",
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage", amount: { powerOf: "source" }, who: "you" },
            { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
