import { defineCard } from "../define.js";

// EDHREC rank 14078.
//
// The dies trigger looks back in time (rule 603.10a): "with the greatest
// power among creatures that player controls" is the creature as it
// compared just before it died — with whatever died beside it, and before a
// lord that died with it stopped pumping the others — kept in its snapshot
// (`greatestAmongItsController` on a departed permanent). Ties count: each
// creature tied for the greatest has it.

const TRIGGER =
  "Whenever a creature an opponent controls with the greatest power among creatures that player controls dies, draw a card and put a +1/+1 counter on Kraven the Hunter.";

export default defineCard({
  name: "Kraven the Hunter",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Villain"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: {
          type: "creature",
          controlledBy: "opponent",
          greatestAmongItsController: { of: "power", among: { type: "creature" } },
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
