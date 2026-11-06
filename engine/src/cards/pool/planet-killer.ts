import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it for each land that player controls.";

export default defineCard({
  name: "Planet Killer",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 9,
  toughness: 9,
  keywords: ["flying", "indestructible"],
  text: `Flying, indestructible\nThis creature attacks each combat if able.\n${DAMAGE_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-attack"], text: "This creature attacks each combat if able." }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { countOf: { type: "land", controlledBy: "you" }, forPlayer: "trigger-player" },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
