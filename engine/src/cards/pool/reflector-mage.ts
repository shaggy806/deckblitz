import { defineCard } from "../define.js";

// The ban is made first and the creature returned after, in one resolution: a
// returned token has no name left to read (rule 704.5d), and its owner still
// can't cast spells with that name.
const TEXT =
  "When this creature enters, return target creature an opponent controls to its owner's hand. That creature's owner can't cast spells with the same name as that creature until your next turn.";

export default defineCard({
  name: "Reflector Mage",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "prohibit", prohibits: [{ act: "cast", who: { ownerOf: 0 }, filter: { sameNameWith: 0 } }], duration: "until-your-next-turn" },
          { kind: "return-to-hand", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
