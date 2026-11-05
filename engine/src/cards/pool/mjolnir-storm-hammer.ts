import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// With no legal target the whole ability does nothing (the ruling): the damage
// is part of the targeted ability, not of a separate one.
const ENTERS_TEXT = "When Mjölnir enters, attach it to target legendary creature you control.";
const ATTACK_TEXT =
  "Whenever equipped creature attacks, tap target creature defending player controls and put a stun counter on it. Then Mjölnir deals damage to each opponent equal to the number of tapped creatures that opponent controls.";

export default defineCard({
  name: "Mjölnir, Storm Hammer",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${ATTACK_TEXT}\nEquip {4}`,
  activated: [equip("{4}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", supertype: "legendary" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          {
            kind: "damage",
            who: "each-opponent",
            amount: { countOf: { type: "creature", tapped: true, controlledBy: "you" }, forEachPlayer: true },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
