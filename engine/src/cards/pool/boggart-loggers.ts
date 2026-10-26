import { defineCard } from "../define.js";

export default defineCard({
  name: "Boggart Loggers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["forestwalk"],
  text: "Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)\n{2}{B}, Sacrifice this creature: Destroy target Treefolk or Forest.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { subtypes: ["Treefolk", "Forest"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{B}, Sacrifice this creature: Destroy target Treefolk or Forest.",
    },
  ],
});
