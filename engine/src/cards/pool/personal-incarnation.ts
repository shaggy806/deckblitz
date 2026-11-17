import { defineCard } from "../define.js";

// Unlimited Edition (2ED). EDHREC rank 30805.
//
// Its owner alone may activate the redirection (`onlyBy: "owner"`, rule
// 602.1b), whoever controls it; the damage goes to its owner (rule 614.9).
// Its owner, not its controller, loses the life as it dies (the rulings) —
// only when it goes to a graveyard; half a negative life total is half of 0,
// so nothing is lost (the rulings, rule 107.1b).
const REDIRECT =
  "{0}: The next 1 damage that would be dealt to this creature this turn is dealt to its owner instead. Only this creature's owner may activate this ability.";
const DIES = "When this creature dies, its owner loses half their life, rounded up.";

export default defineCard({
  name: "Personal Incarnation",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar", "Incarnation"],
  power: 6,
  toughness: 6,
  text: `${REDIRECT}\n${DIES}`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1, redirectTo: { ownerOf: "source" } },
      onlyBy: "owner",
      resolve: null,
      text: REDIRECT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: { ownerOf: "source" },
        amount: { half: { lifeTotal: "each" }, round: "up" },
      },
      resolve: null,
      text: DIES,
    },
  ],
});
