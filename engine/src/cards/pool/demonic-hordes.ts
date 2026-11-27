import { defineCard } from "../define.js";

// EDHREC rank 25666. "Sacrifice a land of an opponent's choice": Wormfang
// Crab's `choose-opponent` (the controller picks which opponent, asked only
// with two or more), then that opponent's `choose-permanents` among the lands
// the Hordes' controller controls (`controlledByPlayer: "you"`), and the land
// sacrificed by its controller (`byItsController` — rule 701.21a: only a
// permanent's controller sacrifices it). The choice isn't targeted.

const DESTROY_TEXT = "{T}: Destroy target land.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, unless you pay {B}{B}{B}, tap this creature and sacrifice a land of an opponent's choice.";

export default defineCard({
  name: "Demonic Hordes",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  text: `${DESTROY_TEXT}\n${UPKEEP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{B}{B}{B}", text: "Pay {B}{B}{B}." }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: "source" },
            {
              kind: "choose-opponent",
              then: {
                kind: "choose-permanents",
                chooser: "that-player",
                controlledByPlayer: "you",
                filter: { type: "land" },
                min: 1,
                upTo: 1,
                prompt: "Choose a land they control to sacrifice",
                then: { kind: "sacrifice-target", target: 0, byItsController: true },
              },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
