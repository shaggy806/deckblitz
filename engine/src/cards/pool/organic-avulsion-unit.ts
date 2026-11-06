import { defineCard } from "../define.js";

// EDHREC rank 28233.

const MENACE_TEXT =
  "{2}: Artifact creatures you control gain menace until end of turn. (A creature with menace can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Organic Avulsion Unit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 3,
  text: MENACE_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { types: ["artifact", "creature"], controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: MENACE_TEXT,
    },
  ],
});
