import { defineCard } from "../define.js";
import { undying } from "../helpers.js";

// "For each counter on Nardole": every counter of every kind (`countersOn`
// with no `counter`), as Cheering Crowd's mana counts them.
const MANA_TEXT = "{T}: Add {U} for each counter on Nardole. Spend this mana only to cast noncreature spells.";

export default defineCard({
  name: "Nardole, Resourceful Cyborg",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Scientist"],
  power: 1,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${MANA_TEXT}\nUndying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: { countersOn: "source" },
        spendOnly: { spell: { notTypes: ["creature"] }, text: "Spend this mana only to cast noncreature spells." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [undying()],
});
