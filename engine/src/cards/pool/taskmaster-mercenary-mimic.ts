import { defineCard } from "../define.js";

// With no target, he stays as he is. A permanent's copiable values as they are, a
// graveyard card's printed ones. The exception keeps him himself: his name and
// creature types, and legendary.
const TEXT =
  "Photographic Reflexes — At the beginning of your first main phase, until your next turn, Taskmaster becomes a copy of up to one target creature on the battlefield or creature card in a graveyard, except his name is Taskmaster, Mercenary Mimic and he's a legendary Human Mercenary Villain creature.";

export default defineCard({
  name: "Taskmaster, Mercenary Mimic",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Villain"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [
        {
          kind: "optional",
          of: { kind: "one-of", of: ["creature", { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }] },
        },
      ],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        ofCard: "when-a-card",
        until: "your-next-turn",
        exceptions: {
          name: "Taskmaster, Mercenary Mimic",
          setTypes: ["creature"],
          setSubtypes: ["Human", "Mercenary", "Villain"],
          addSupertypes: ["legendary"],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
