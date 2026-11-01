import { defineCard } from "../define.js";

const TEXT =
  "Whenever Don & Raph attack, the next noncreature spell you cast this turn has affinity for artifacts. (It costs {1} less to cast for each artifact you control.)";

export default defineCard({
  name: "Don & Raph, Hard Science",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { notTypes: ["creature"] },
        affinityFor: { type: "artifact", controlledBy: "you" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
