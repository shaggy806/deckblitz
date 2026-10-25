import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 17572.
//
// The added ability is a copiable value (rule 707.9a), so a copy of the
// Pretender has it too; choosing nothing leaves a 0/0 Shapeshifter (the
// rulings).

const BOUNCE_TEXT = "{2}{U}{U}: Return this creature to its owner's hand.";

export default defineCard({
  name: "Mercurial Pretender",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text: `You may have this creature enter as a copy of a creature you control, except it has "${BOUNCE_TEXT}"`,
  copyOnEnter: {
    filter: { type: "creature", controlledBy: "you" },
    except: {
      activated: [
        {
          cost: { mana: "{2}{U}{U}", tap: false },
          targets: [],
          effect: { kind: "return-to-hand", target: "source" },
          resolve: null,
          text: BOUNCE_TEXT,
        },
      ],
    },
  },
});
