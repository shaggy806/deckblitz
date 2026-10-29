import { defineCard } from "../define.js";

// EDHREC rank 2470.
//
// "Each player may put … on a creature they control" is a choice in turn order
// starting with you (the ruling; it's your end step), each knowing the ones
// before (`vote` with `choose`, `own`: the chooser's creatures, `upToOne`: may).
// Then every chosen creature gets its counters at once — put by the player who
// chose it (`by`) — and only those that did get counters this way are goaded
// (`thisWay: "counters-put"`): a replacement that stops them stops the goad too.
const TEXT =
  "At the beginning of your end step, each player may put two +1/+1 counters on a creature they control. Goad each creature that had counters put on it this way.";

export default defineCard({
  name: "Agitator Ant",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            startingWith: "you",
            for: { permanent: { type: "creature", controlledBy: "you" }, own: true, upToOne: true },
          },
          {
            kind: "for-each-voted",
            which: "voted",
            simultaneous: true,
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2, by: { controllerOfTarget: 0 } },
          },
          { kind: "goad", filter: { type: "creature", thisWay: "counters-put" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
