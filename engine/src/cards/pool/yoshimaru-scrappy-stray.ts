import { defineCard } from "../define.js";

// EDHREC rank 25083.
//
// "Up to one target creature an opponent controls": with none chosen there's
// nothing to fight, and nothing happens (rule 701.14b, as with either
// creature gone by resolution).
const ENTER_TEXT =
  "When Yoshimaru enters, another target creature you control fights up to one target creature an opponent controls.";
const COUNTER_TEXT = "{6}: Put a +1/+1 counter on target nonlegendary creature.";

export default defineCard({
  name: "Yoshimaru, Scrappy Stray",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT} (Each deals damage equal to its power to the other.)\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "other", of: "creature-you-control" },
        { kind: "optional", of: "creature-an-opponent-controls" },
      ],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", notSupertype: "legendary" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
