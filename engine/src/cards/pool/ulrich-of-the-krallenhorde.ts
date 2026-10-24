import { defineCard } from "../define.js";

// EDHREC rank 11033.
//
// Rulings:
//   [2016-07-13] If Ulrich is no longer on the battlefield as Ulrich, Uncontested Alpha's first
//     ability resolves, the targeted creature won't deal or be dealt damage.
//   [2016-07-13] You choose the target of the Ulrich, Uncontested Alpha's first ability as it goes
//     on the stack, but you choose whether or not to fight as that ability resolves.
//   [2016-07-13] Ulrich, Uncontested Alpha's last ability only triggers if a single player has
//     cast two or more spells during the previous turn. If multiple players each cast just one
//     spell during the previous turn, the ability won't trigger.
//   [2016-07-13] To trigger the Werewolf's back face's transform ability, a single player must
//     have cast two or more spells during the previous turn. If multiple players each cast just
//     one spell during the previous turn, the ability won't trigger.
//   [2016-07-13] The abilities that transform a Werewolf back and forth look at the entire
//     previous turn, even if the Werewolf with that ability wasn't on the battlefield for some or
//     all of that turn.
//   [2016-07-13] If the targeted creature is an illegal target when Ulrich, Uncontested Alpha's
//     first ability tries to resolve, the ability doesn't resolve.

const ENTER_TEXT =
  "Whenever this creature enters or transforms into Ulrich of the Krallenhorde, target creature gets +4/+4 until end of turn.";

export default defineCard({
  name: "Ulrich of the Krallenhorde",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 4,
  toughness: 4,
  text: "Whenever this creature enters or transforms into Ulrich of the Krallenhorde, target creature gets +4/+4 until end of turn.\nAt the beginning of each upkeep, if no spells were cast last turn, transform Ulrich of the Krallenhorde.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "transforms", who: "self", intoFront: true },
      sameAbilityAs: 0,
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform Ulrich of the Krallenhorde.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  faces: ["Ulrich of the Krallenhorde", "Ulrich, Uncontested Alpha"],
  transform: true,
});
