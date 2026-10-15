import { defineCard } from "../define.js";

// The back face of Ultimecia, Time Sorceress (Black Chocobo's `transforms`
// trigger, rule 712.10).
const TIME_TEXT =
  "Time Compression — When this creature transforms into Ultimecia, Omnipotent, take an extra turn after this one.";

export default defineCard({
  name: "Ultimecia, Omnipotent",
  art: "https://cards.scryfall.io/art_crop/back/2/d/2d6a2b68-5407-464e-a335-7866fd969c30.jpg",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Nightmare", "Warlock"],
  power: 7,
  toughness: 7,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TIME_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: TIME_TEXT,
    },
  ],
  faces: ["Ultimecia, Time Sorceress", "Ultimecia, Omnipotent"],
  transform: true,
});
