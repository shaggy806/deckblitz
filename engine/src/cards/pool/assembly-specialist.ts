import { defineCard } from "../define.js";

// EDHREC rank 30837.
// Makes Borg → use "Borg Token".

export default defineCard({
  name: "Assembly Specialist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create a 1/1 colorless Borg artifact creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Borg Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 colorless Borg artifact creature token.",
    },
  ],
});
