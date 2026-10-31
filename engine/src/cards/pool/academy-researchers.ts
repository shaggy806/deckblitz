import { defineCard } from "../define.js";

// The Aura enters attached to this creature (`attachedTo: "source"`): one
// that can't legally enchant it — or with this creature gone — stays in hand
// (rule 303.4i).

const TEXT =
  "When this creature enters, you may put an Aura card from your hand onto the battlefield attached to this creature.";

export default defineCard({
  name: "Academy Researchers",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { subtype: "Aura" },
        attachedTo: "source",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
