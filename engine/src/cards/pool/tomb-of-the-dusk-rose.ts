import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add one mana of any color.";
const PUT_TEXT = "{2}{W}{B}, {T}: Put a creature card exiled with this permanent onto the battlefield under your control.";

export default defineCard({
  name: "Tomb of the Dusk Rose",
  art: "https://cards.scryfall.io/art_crop/back/1/d/1d94ff37-f04e-48ee-8253-d62ab07f0632.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `(Transforms from Profane Procession.)\n${MANA_TEXT}\n${PUT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}{W}{B}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
  faces: ["Profane Procession", "Tomb of the Dusk Rose"],
  transform: true,
});
