import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Whenever this creature or another Ally you control enters, you may destroy target artifact. If that artifact is put into a graveyard this way, this creature deals damage to that artifact's controller equal to the number of Allies you control.";

// No damage unless the artifact was destroyed and reached a graveyard — not
// if it's indestructible, regenerated, or sent elsewhere; a destroyed token
// still counts (the rulings).
export default defineCard({
  name: "Tuktuk Scrapper",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: ["artifact"],
      effect: {
        kind: "may",
        prompt: "Destroy target artifact?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "died" },
              then: {
                kind: "damage",
                amount: { countOf: { subtype: "Ally", controlledBy: "you" } },
                toControllerOfTarget: 0,
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
