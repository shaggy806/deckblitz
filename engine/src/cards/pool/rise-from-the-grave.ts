import { defineCard } from "../define.js";

// "That creature is a black Zombie in addition to its other colors and
// types" is part of the effect that puts it there (`enterAs`), in place as it
// enters: "whenever a Zombie enters" sees it arrive as one, and it stays a
// black Zombie for as long as it's on the battlefield (rule 611.2c).
export default defineCard({
  name: "Rise from the Grave",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Put target creature card from a graveyard onto the battlefield under your control. That creature is a black Zombie in addition to its other colors and types.",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  effect: {
    kind: "put-onto-battlefield",
    target: 0,
    underYourControl: true,
    enterAs: { addColors: ["B"], addSubtypes: ["Zombie"] },
  },
});
