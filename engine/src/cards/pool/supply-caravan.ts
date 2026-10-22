import { defineCard } from "../define.js";

// EDHREC rank 30499. Amonkhet. An intervening-if (rule 603.4), checked as it
// enters and again as it resolves; Supply Caravan itself counts if it entered
// tapped (the rulings).
const TEXT =
  "When this creature enters, if you control a tapped creature, create a 1/1 white Warrior creature token with vigilance.";

export default defineCard({
  name: "Supply Caravan",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Camel"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "creature", tapped: true }, atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token (Vigilance)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
