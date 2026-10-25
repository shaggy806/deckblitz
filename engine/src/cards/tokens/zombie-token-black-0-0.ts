import { defineCard } from "../define.js";

// A black Zombie printed 0/0 (*/*): its size comes from `create-token`'s
// `basePt` as it's made — Soul Separator's "power equal to that card's power
// and toughness equal to that card's toughness".
export default defineCard({
  name: "Zombie Token (Black 0/0)",
  art: "ae290b7e-8ff2-4262-8ac7-8481283e2a02",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  text: "",
});
