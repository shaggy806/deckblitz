import { defineCard } from "../define.js";

// EDHREC rank 11326.

export default defineCard({
  name: "Norika Yamazaki, the Poet",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever a Samurai or Warrior you control attacks alone, you may cast target enchantment card from your graveyard this turn.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment" } }],
      effect: { kind: "grant-graveyard-cast", target: 0 },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, you may cast target enchantment card from your graveyard this turn.",
    },
  ],
});
