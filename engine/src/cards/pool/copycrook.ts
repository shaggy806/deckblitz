import { defineCard } from "../define.js";

// EDHREC rank 5993.
//
// Phantasmal Image's shape: the granted trigger is a copy exception (rule
// 707.9a), so a copy of Copycrook has it too. Declining, it's a 0/0 without
// the ability (its ruling).

const CONNIVE_TEXT = "Whenever this creature attacks, it connives.";

export default defineCard({
  name: "Copycrook",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Rogue"],
  power: 0,
  toughness: 0,
  text: `You may have this creature enter as a copy of any creature on the battlefield, except it has "${CONNIVE_TEXT}" (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)`,
  copyOnEnter: {
    filter: { type: "creature" },
    except: {
      triggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "connive", target: "source" },
          resolve: null,
          text: CONNIVE_TEXT,
        },
      ],
    },
  },
});
