import { defineCard } from "../define.js";

// Rulings:
//   [2022-10-14] Protection from everything (rule 702.16j): all damage that would be dealt to
//     you is prevented, Auras can't be attached to you, and you can't be the target of spells
//     or abilities. Nothing else is prevented — creatures can still attack you.
//   [2022-10-14] Gaining it gives a spell or ability on the stack that targets you an illegal
//     target.

const TEXT = "{2}, {T}, Exile The Stasis Coffin: You gain protection from everything until your next turn.";

export default defineCard({
  name: "The Stasis Coffin",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, exileSelf: true },
      targets: [],
      effect: { kind: "player-effect", duration: "until-your-next-turn", protectionFromEverything: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
