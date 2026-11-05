import { defineCard } from "../define.js";

export default defineCard({
  name: "Nighteyes the Desecrator",
  art: "https://cards.scryfall.io/art_crop/front/a/0/a00a7180-49bd-4ead-852a-67b6b5e4b933.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat", "Wizard"],
  power: 4,
  toughness: 2,
  text: "{4}{B}: Put target creature card from a graveyard onto the battlefield under your control.",
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: "{4}{B}: Put target creature card from a graveyard onto the battlefield under your control.",
    },
  ],
  faces: ["Nezumi Graverobber", "Nighteyes the Desecrator"],
  flip: true,
});
