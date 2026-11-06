import { defineCard } from "../define.js";

// EDHREC rank 30125.

const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, this creature gets +2/+2 until end of turn.";
const PLANET_TEXT =
  '{6}: Create a tapped Planet land token named New Planet with "{T}: Add one mana of any color." Activate only as a sorcery.';

export default defineCard({
  name: "Saurian Explorer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Scout"],
  power: 4,
  toughness: 3,
  text: `${LANDFALL_TEXT}\n${PLANET_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
      resolve: null,
      sorcerySpeed: true,
      text: PLANET_TEXT,
    },
  ],
});
