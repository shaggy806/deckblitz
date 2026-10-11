import { defineCard } from "../define.js";

// EDHREC rank 15799.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a 0/3 colorless Wall creature token with defender and reach.";
const ATTACK_TEXT =
  "Whenever you attack, you may pay {R}{G}{W}{U}. When you do, target creature gets +1/+0 until end of turn for each creature you control and can't be blocked this turn.";

export default defineCard({
  name: "Invisible Woman",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  text: `${COMBAT_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      // Alicia Masters, Skilled Sculptor's intervening-if.
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "create-token", token: "Wall Token (Invisible Woman)", count: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      // "When you do" is a reflexive ability (rule 603.12), targeting once
      // the cost is paid; the count is fixed as it resolves (rule 608.2h).
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R}{G}{W}{U} to pump a creature and make it unblockable this turn?",
        cost: "{R}{G}{W}{U}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "modify-pt",
                target: 0,
                power: { countOf: { type: "creature", controlledBy: "you" } },
                toughness: 0,
                duration: "end-of-turn",
              },
              { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
            ],
          },
          text: "Target creature gets +1/+0 until end of turn for each creature you control and can't be blocked this turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
