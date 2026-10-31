import { defineCard } from "../define.js";

// March of the Machine (MOM). EDHREC rank 22846. Any artifact or creature put
// into any graveyard from the battlefield this turn, tokens included, though
// the card has left the graveyard since (the rulings) — an intervening "if"
// (rule 603.4), so with none it doesn't trigger.

const TEXT =
  "At the beginning of your end step, if an artifact or creature was put into a graveyard from the battlefield this turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Ichor Shade",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Shade"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
      condition: {
        kind: "turn-history",
        what: "to-graveyard",
        who: "any-player",
        from: ["battlefield"],
        filter: { typesAnyOf: ["artifact", "creature"] },
      },
    },
  ],
});
