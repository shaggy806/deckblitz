import { defineCard } from "../define.js";

// EDHREC rank 29048. "A creature spell that has an Adventure": an adventurer
// card cast as a creature — never one cast as its Adventure, which is an
// instant or sorcery spell on the stack (the rulings).

const TEXT =
  "Whenever you cast a creature spell that has an Adventure, this creature gets +1/+1 until end of turn. (It doesn't need to have gone on the adventure first.)";

export default defineCard({
  name: "Garenbrig Squire",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", hasAdventure: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
