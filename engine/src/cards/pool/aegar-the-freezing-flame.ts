import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature or planeswalker an opponent controls is dealt excess damage, if a Giant, Wizard, or spell you controlled dealt damage to it this turn, draw a card.";

// The "if" is on the trigger: what dealt it damage this turn only ever grows,
// and one that has died is asked as it last was, so it can't turn false before
// the ability resolves (rule 603.4 has nothing further to ask).
export default defineCard({
  name: "Aegar, the Freezing Flame",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "dealt-damage",
        who: "opponent",
        filter: {
          typesAnyOf: ["creature", "planeswalker"],
          anyOf: [
            { damagedThisTurnBy: { subtype: "Giant", controlledBy: "you" } },
            { damagedThisTurnBy: { subtype: "Wizard", controlledBy: "you" } },
            { damagedThisTurnBy: { spell: true, controlledBy: "you" } },
          ],
        },
        excess: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
