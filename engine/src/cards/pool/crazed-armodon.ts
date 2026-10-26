import { defineCard } from "../define.js";

// EDHREC rank 31954.

const TEXT =
  "{G}: This creature gets +3/+0 and gains trample until end of turn. Destroy this creature at the beginning of the next end step. Activate only once each turn.";

export default defineCard({
  name: "Crazed Armodon",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Destroy Crazed Armodon.",
            effect: { kind: "destroy", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
      oncePerTurn: true,
    },
  ],
});
