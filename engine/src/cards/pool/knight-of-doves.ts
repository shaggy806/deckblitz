import { defineCard } from "../define.js";

// EDHREC rank 16673.
//
// An enchantment token you controlled (a Role) is put into a graveyard before
// it ceases to exist, so it triggers this too (the ruling).

export default defineCard({
  name: "Knight of Doves",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 3,
  text: "Whenever an enchantment you control is put into a graveyard from the battlefield, create a 1/1 white Bird creature token with flying.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 1 },
      resolve: null,
      text: "Whenever an enchantment you control is put into a graveyard from the battlefield, create a 1/1 white Bird creature token with flying.",
    },
  ],
});
