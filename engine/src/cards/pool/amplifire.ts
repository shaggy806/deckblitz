import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, reveal cards from the top of your library until you reveal a creature card. Until your next turn, this creature's base power becomes twice that card's power and its base toughness becomes twice that card's toughness. Put the revealed cards on the bottom of your library in a random order.";

// Two base-P/T effects (layer 7b), in timestamp order: first 0/0, then — once
// a creature card is found, and before the revealed cards go to the bottom —
// twice that card's power and toughness, which, being later, wins. With no
// creature card in the library only the 0/0 is left (the ruling: it becomes a
// 0/0, and the whole library goes back in a random order). Both last until
// your next turn, so it's a 1/1 again from your untap step until this
// resolves (the ruling). The values are locked in as it resolves.
export default defineCard({
  name: "Amplifire",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 0,
            toughness: 0,
            addTypes: [],
            addSubtypes: [],
            duration: "until-your-next-turn",
          },
          {
            kind: "reveal-until",
            filter: { type: "creature" },
            rest: "bottom-random",
            then: {
              kind: "animate",
              target: "source",
              power: { product: [{ powerOf: 0 }, 2] },
              toughness: { product: [{ toughnessOf: 0 }, 2] },
              addTypes: [],
              addSubtypes: [],
              duration: "until-your-next-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
