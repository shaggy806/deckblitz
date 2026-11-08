import { defineCard } from "../define.js";

// "During any turn you attacked with this creature": this creature, in the stint
// that exiled the card, however combat has gone since — even once it has left the
// battlefield (the ruling). Another Goblin Researcher's attack doesn't count (the
// ruling), nor does one the same card made after coming back (rule 400.7).
const TEXT =
  "When this creature enters, exile the top card of your library. During any turn you attacked with this creature, you may play that card.";

export default defineCard({
  name: "Goblin Researcher",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "while-exiled", play: true, sourceDid: "attacked" },
      resolve: null,
      text: TEXT,
    },
  ],
});
