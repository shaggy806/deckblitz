import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, manifest the top card of your library. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Sultai Emissary",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 1,
  toughness: 1,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
