import { defineCard } from "../define.js";

export default defineCard({
  name: "Emissary of the Sleepless",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, if a creature died this turn, create a 1/1 white Spirit creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: "When this creature enters, if a creature died this turn, create a 1/1 white Spirit creature token with flying.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
