import { defineCard } from "../define.js";

// Any die you roll, for any reason: each die that comes up 2, 4 or 6 (its
// modifier included, rule 706.2) triggers once (the rulings).
const ENTERS_TEXT = "When Dee Kay enters, open an Attraction.";
const TWO_TEXT = "Whenever you roll a 2, each opponent loses 1 life and you gain 1 life.";
const FOUR_TEXT = "Whenever you roll a 4, you may tap or untap target artifact or creature.";
const SIX_TEXT = "Whenever you roll a 6, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Dee Kay, Finder of the Lost",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Employee"],
  power: 1,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${TWO_TEXT}\n${FOUR_TEXT}\n${SIX_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 2, atMost: 2 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TWO_TEXT,
    },
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 4, atMost: 4 } },
      targets: ["artifact-or-creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: FOUR_TEXT,
    },
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 6, atMost: 6 } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: SIX_TEXT,
    },
  ],
});
