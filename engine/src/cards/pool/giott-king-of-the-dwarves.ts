import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 10011. "Giott or another Dwarf you control enters and whenever
// an Equipment you control enters" is Giott's own entry (whatever it is by
// then) and every other Dwarf's or Equipment's — `thisOrAnother`'s two
// triggers, the second over both kinds of permanent: one trigger per entering
// object either way.
const TEXT =
  "Whenever Giott or another Dwarf you control enters and whenever an Equipment you control enters, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Giott, King of the Dwarves",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Noble"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: `Double strike\n${TEXT}`,
  triggered: thisOrAnother({
    trigger: {
      on: "enters-battlefield",
      who: "you-control",
      filter: { anyOf: [{ subtype: "Dwarf" }, { subtype: "Equipment" }] },
    },
    targets: [],
    effect: {
      kind: "may",
      prompt: "Discard a card to draw a card?",
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
        ],
      },
    },
    resolve: null,
    text: TEXT,
  }),
});
