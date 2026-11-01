import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, put a wind counter on this enchantment, then sacrifice this enchantment unless you pay {G} for each wind counter on it. If you pay, this enchantment deals damage equal to the number of wind counters on it to each creature and each player.";

const WIND = { countersOn: "source", counter: "wind" } as const;

export default defineCard({
  name: "Cyclone",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "wind", amount: 1 },
          {
            kind: "unless",
            chooser: "you",
            options: [
              {
                pay: "{G}",
                times: WIND,
                text: "Pay {G} for each wind counter",
                ifPaid: {
                  kind: "sequence",
                  simultaneous: true,
                  effects: [
                    { kind: "damage-all", filter: { type: "creature" }, amount: WIND },
                    { kind: "damage", amount: WIND, who: "each-player" },
                  ],
                },
              },
            ],
            otherwise: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
