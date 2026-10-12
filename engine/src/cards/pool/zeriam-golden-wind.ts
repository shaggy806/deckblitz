import { defineCard } from "../define.js";

export default defineCard({
  name: "Zeriam, Golden Wind",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever a Griffin you control deals combat damage to a player, create a 2/2 white Griffin creature token with flying.",
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { subtype: "Griffin" },
      },
      targets: [],
      effect: { kind: "create-token", token: "Griffin Token", count: 1 },
      resolve: null,
      text: "Whenever a Griffin you control deals combat damage to a player, create a 2/2 white Griffin creature token with flying.",
    },
  ],
});
