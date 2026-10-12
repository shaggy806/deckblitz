import { defineCard } from "../define.js";

export default defineCard({
  name: "Biotech Specialist",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Insect", "Scientist"],
  power: 1,
  toughness: 3,
  text: "When this creature enters, create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")\nWhenever you sacrifice an artifact, this creature deals 2 damage to target opponent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Lander token.",
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "artifact" } },
      targets: ["opponent"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "Whenever you sacrifice an artifact, this creature deals 2 damage to target opponent.",
    },
  ],
});
