import { defineCard } from "../define.js";

export default defineCard({
  name: "Pheres-Band Brawler",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, it fights up to one target creature you don't control. (Each deals damage equal to its power to the other.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: "When this creature enters, it fights up to one target creature you don't control.",
    },
  ],
});
