import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Captain Vargus Wrath attacks, Pirates you control get +1/+1 until end of turn for each time you've cast a commander from the command zone this game.";

export default defineCard({
  name: "Captain Vargus Wrath",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 1,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // The Pirates and the count are both fixed as it resolves (rule 611.2c).
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Pirate", controlledBy: "you" },
        power: { commanderCasts: "you" },
        toughness: { commanderCasts: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
