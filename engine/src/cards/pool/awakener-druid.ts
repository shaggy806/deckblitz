import { defineCard } from "../define.js";

// Rulings: any land with the type Forest, whoever controls it (the target is
// mandatory); it stays a land; if the Druid has left before the trigger
// resolves, nothing happens ("while-source" does nothing then — rule 611.2b).

const TEXT =
  "When this creature enters, target Forest becomes a 4/5 green Treefolk creature for as long as this creature remains on the battlefield. It's still a land.";

export default defineCard({
  name: "Awakener Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Forest" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 5,
        addTypes: ["creature"],
        addSubtypes: ["Treefolk"],
        setColors: ["G"],
        duration: "while-source",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
