import { defineCard } from "../define.js";

// A 0/2 colorless Wall artifact creature token with defender (Basalt Golem).

export default defineCard({
  name: "Wall Token (Basalt Golem)",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 2,
  keywords: ["defender"],
  text: "Defender",
});
