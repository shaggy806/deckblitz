import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 26574.
//
// Chroma over the permanents you control is devotion (rule 700.5): hybrid
// symbols count, and this creature's own {R} with them (the rulings).

const TEXT =
  "Chroma — When this creature enters, it gets +X/+0 until end of turn, where X is the number of red mana symbols in the mana costs of permanents you control.";

export default defineCard({
  name: "Heartlash Cinder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: { devotionTo: "R" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
