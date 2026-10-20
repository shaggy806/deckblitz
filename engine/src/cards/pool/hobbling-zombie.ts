import { defineCard } from "../define.js";

// EDHREC rank 16623.

export default defineCard({
  name: "Hobbling Zombie",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhen this creature dies, create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 2/2 black Zombie creature token with decayed.",
    },
  ],
});
