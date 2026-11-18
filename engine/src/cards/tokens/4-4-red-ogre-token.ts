import { defineCard } from "../define.js";

// A 4/4 red Ogre — Grenzo's Rebuttal's token. "Ogre Token" is Kazuul, Tyrant
// of the Cliffs's 3/3; the engine keys tokens by name.
export default defineCard({
  name: "4/4 Red Ogre Token",
  art: "efaa37e5-302e-4b4b-bb2d-6a0f9f80cd3f",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 4,
  toughness: 4,
});
