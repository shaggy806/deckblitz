import { defineCard } from "../define.js";

// EDHREC rank 14762. Guilds of Ravnica. X is read as the trigger resolves; the
// fight is asked then, and only when a target was chosen (with none, it just
// gets +X/+0 — the rulings). A target gone illegal stops the whole ability.

const ETB_TEXT =
  "Undergrowth — When this creature enters, choose up to one target creature you don't control with flying. This creature gets +X/+0 until end of turn, where X is the number of creature cards in your graveyard, then you may have this creature fight that creature.";

export default defineCard({
  name: "Kraul Harpooner",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", filter: { type: "creature", controlledBy: "opponent", keyword: "flying" } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: { countInGraveyard: { type: "creature", ownedBy: "you" } },
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "conditional",
            condition: { kind: "target-chosen", index: 0 },
            then: {
              kind: "may",
              prompt: "Have Kraul Harpooner fight that creature?",
              effect: { kind: "fight", a: "source", b: 0 },
            },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
