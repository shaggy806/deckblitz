import { defineCard } from "../define.js";

// EDHREC rank 13749.
//
// Thespian's Stage's "except it has this ability", lasting until its
// controller's next turn, with a 7/5 exception: a copiable value (rule
// 707.9b), so a later P/T-setting effect still wins and a */* CDA it copies
// is overridden. Becoming a copy drops the begin-combat trigger until it
// reverts (the rulings).
//
// Rulings:
//   [2019-08-23] Activating Volrath's last ability causes it to lose its first ability until your
//     next turn, so if you activate it before the beginning of combat step, it won't trigger
//     during that turn.
//   [2019-08-23] If Volrath becomes a copy of a creature whose power and toughness are defined by
//     an ability (usually printed as */* or similar), Volrath doesn't copy the ability that
//     defines its power and toughness. Volrath remains a 7/5 creature.

const COMBAT_TEXT = "At the beginning of combat on your turn, put a -1/-1 counter on up to one target creature.";
const COPY_TEXT =
  "{1}: Until your next turn, Volrath becomes a copy of target creature with a counter on it, except it's 7/5 and it has this ability.";

export default defineCard({
  name: "Volrath, the Shapestealer",
  manaCost: "{2}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Shapeshifter"],
  power: 7,
  toughness: 5,
  text: `${COMBAT_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } } }],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "your-next-turn",
        exceptions: { basePt: [7, 5], thisAbility: { card: "Volrath, the Shapestealer", activated: 0 } },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
