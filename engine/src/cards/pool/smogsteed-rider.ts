import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 25329.
//
// Tori D'Avenant's "other attacking creatures" grant, sparing the Rider itself
// (the first ruling), whoever controls them; it resolves before blockers.
//
// Rulings:
//   [2006-02-01] Smogsteed Rider doesn't give itself fear, but if two are attacking, each will
//     give the other one fear.
//   [2006-02-01] The creatures gain fear before blockers can be declared.

const TEXT =
  "Whenever this creature attacks, each other attacking creature gains fear until end of turn. (They can't be blocked except by artifact creatures and/or black creatures.)";

export default defineCard({
  name: "Smogsteed Rider",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true },
        keyword: "fear",
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
