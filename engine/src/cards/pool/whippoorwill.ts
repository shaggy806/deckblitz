import { defineCard } from "../define.js";

// Homelands (HML).
//
// "Damage that would be dealt to that creature this turn can't be prevented or dealt instead to
// another permanent or player" is a `prohibit` of `have-damage-prevented` with `orRedirected`
// (rules 615.12, 614.9), bound to the target as it is (rule 400.7). "When the creature dies this
// turn, exile the creature" is a delayed `leaves` trigger whose trigger object is the card in the
// graveyard.

const TEXT =
  "{G}{G}, {T}: Target creature can't be regenerated this turn. Damage that would be dealt to that creature this turn can't be prevented or dealt instead to another permanent or player. When the creature dies this turn, exile the creature.";

export default defineCard({
  name: "Whippoorwill",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{G}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "cant-regenerate", target: 0 },
          { kind: "prohibit", prohibits: [{ act: "have-damage-prevented", target: 0, orRedirected: true }] },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard"], thisTurn: true },
            text: "When the creature dies this turn, exile the creature.",
            effect: { kind: "exile", target: "trigger-object" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
