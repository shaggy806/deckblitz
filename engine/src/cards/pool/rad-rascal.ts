import { defineCard } from "../define.js";

// Opens an Attraction as it enters (rule 701.51): nothing without an
// Attraction deck (701.51a).

const OPEN = "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";

export default defineCard({
  name: "Rad Rascal",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil", "Employee"],
  power: 3,
  toughness: 3,
  text: `${OPEN}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
  ],
});
