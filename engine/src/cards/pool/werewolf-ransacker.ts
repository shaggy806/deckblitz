import { defineCard } from "../define.js";

const RANSACK =
  "Whenever this creature transforms into Werewolf Ransacker, you may destroy target artifact. If that artifact is put into a graveyard this way, this creature deals 3 damage to that artifact's controller.";

export default defineCard({
  name: "Werewolf Ransacker",
  art: "https://cards.scryfall.io/art_crop/back/a/2/a2c044c0-3625-4bdf-9445-b462394cecae.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 4,
  text: `${RANSACK}\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.`,
  triggered: [
    {
      // The target is chosen as the trigger goes on the stack; whether to
      // destroy it, as it resolves (the ruling). "Put into a graveyard this
      // way": destroyed and gone to a graveyard — not if indestructible,
      // regenerated or replaced elsewhere (the rulings).
      trigger: { on: "transforms", who: "self", intoFront: false },
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
              then: { kind: "damage", amount: 3, toControllerOfTarget: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: RANSACK,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Afflicted Deserter", "Werewolf Ransacker"],
  transform: true,
});
