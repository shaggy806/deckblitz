import { defineCard } from "../define.js";

// Order of the Mirror's back face. Once per blocking creature (the blocker
// is the trigger object).
const TEXT =
  "Whenever this creature becomes blocked by a creature, the blocking creature gets -1/-1 until end of turn.";

export default defineCard({
  name: "Order of the Alabaster Host",
  art: "https://cards.scryfall.io/art_crop/back/1/0/103295ed-5ddc-4528-8848-4fd2cfec4b88.jpg",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Order of the Mirror", "Order of the Alabaster Host"],
  transform: true,
});
