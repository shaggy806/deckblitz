import { defineCard } from "../define.js";

const ENTERS = "When Azor enters, each opponent can't cast instant or sorcery spells during that player's next turn.";
const ATTACKS = "Whenever Azor attacks, you may pay {X}{W}{U}{U}. If you do, you gain X life and draw X cards.";

// Sphinx's Decree's effect as it enters: a player effect for each opponent
// that waits for their next turn.
export default defineCard({
  name: "Azor, the Lawbringer",
  manaCost: "{2}{W}{W}{U}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "player-effect",
          duration: { duringTurnOf: "that-player" },
          cantCast: { who: "that-player", filter: { typesAnyOf: ["instant", "sorcery"] }, label: "instant or sorcery spells" },
        },
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X}{W}{U}{U} to gain X life and draw X cards?",
        cost: "{X}{W}{U}{U}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: "x" },
            { kind: "draw", amount: "x" },
          ],
        },
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
