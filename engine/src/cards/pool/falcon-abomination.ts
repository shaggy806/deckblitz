import { defineCard } from "../define.js";

export default defineCard({
  name: "Falcon Abomination",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 2/2 black Zombie creature token with decayed.",
    },
  ],
});
