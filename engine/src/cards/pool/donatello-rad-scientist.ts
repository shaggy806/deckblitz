import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Donatello enters, tap up to three target creatures your opponents control. Put a stun counter on each of them.";

export default defineCard({
  name: "Donatello, Rad Scientist",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 5,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${ENTERS_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature-an-opponent-controls", max: 3 }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
          { kind: "for-each-target", from: 0, effect: { kind: "add-counter", target: 0, counter: "stun", amount: 1 } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
