import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// The echo cost is your life total as the echo trigger resolves, not locked in
// (the ruling): `payGeneric` reads it then. The damage is any number you choose
// as the enters ability resolves, 0 included (the ruling).
const ETB = "When this creature enters, it deals an amount of damage of your choice to you and target creature. The damage can't be prevented.";

export default defineCard({
  name: "Volcano Hellion",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 6,
  toughness: 5,
  text:
    "This creature has echo {X}, where X is your life total. (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\n" +
    ETB,
  triggered: [
    echo({ payGeneric: { lifeTotal: "you" }, text: "Pay {X}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "choose-value",
        value: "number",
        min: 0,
        prompt: "How much damage?",
        then: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage", amount: "x", who: "you", cantBePrevented: true },
            { kind: "damage", amount: "x", target: 0, cantBePrevented: true },
          ],
        },
      },
      resolve: null,
      text: ETB,
    },
  ],
});
