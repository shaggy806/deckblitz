import { defineCard } from "../define.js";

// EDHREC rank 9362.

export default defineCard({
  name: "Requiem Angel",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever another non-Spirit creature you control dies, create a 1/1 white Spirit creature token with flying.",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", notSubtypes: ["Spirit"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: "Whenever another non-Spirit creature you control dies, create a 1/1 white Spirit creature token with flying.",
    },
  ],
});
