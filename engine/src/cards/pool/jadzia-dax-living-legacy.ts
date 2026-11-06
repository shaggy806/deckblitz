import { defineCard } from "../define.js";

// EDHREC rank 26036.

const MAIN_TEXT =
  "At the beginning of your first main phase, put a +1/+1 counter on Jadzia Dax, then add an amount of {G} equal to the number of counters on her.";
const SYMBIONT_TEXT = "Transfer Symbiont — {2}{G}, Discard this card: Put two +1/+1 counters on target creature.";

// "The number of counters on her" is every kind (`countersOn` with no
// `counter`), read as she last existed if she has left by then.
export default defineCard({
  name: "Jadzia Dax, Living Legacy",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Trill", "Scientist"],
  power: 0,
  toughness: 1,
  text: `${MAIN_TEXT}\n${SYMBIONT_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      zone: "hand",
      text: SYMBIONT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "add-mana", mana: "G", amount: { countersOn: "source" } },
        ],
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
