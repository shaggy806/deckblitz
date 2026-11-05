import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

export default defineCard({
  name: "Kenzo the Hardhearted",
  art: "https://cards.scryfall.io/art_crop/front/8/6/864ad989-19a6-4930-8efc-bbc077a18c32.jpg",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 4,
  keywords: ["double-strike"],
  text: "Double strike; bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)",
  triggered: bushido(2),
  faces: ["Bushi Tenderfoot", "Kenzo the Hardhearted"],
  flip: true,
});
