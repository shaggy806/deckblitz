import { defineCard } from "../define.js";
import { atLevel, classLevel } from "../helpers.js";

// EDHREC rank 8787. A Class (rule 716): each level bar is a sorcery-speed
// activated ability from the level below, and the abilities under it are
// gated on the level (`atLevel`). Level 1 mills a card first, then picks the
// exiled card at random from the whole graveyard, the milled card included;
// the play permission is the ordinary one, so a land still needs a land drop
// (the ruling). Level 2 triggers once for a simultaneous leave (the ruling).
// Level 3 is `costModification.notFromCastersHand`.
export default defineCard({
  name: "Advanced Reconstruction",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: "(Gain the next level as a sorcery to add its ability.)\nAt the beginning of your first main phase, mill a card, then exile a card from your graveyard at random. You may play the exiled card this turn.\n{1}{R}: Level 2\nWhenever one or more cards leave your graveyard, this Class deals 2 damage to each opponent.\n{1}{R}: Level 3\nSpells you cast from anywhere other than your hand cost {2} less to cast.",
  static: [
    atLevel(3, {
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", notFromCastersHand: true, reduceGeneric: 2 },
      text: "Spells you cast from anywhere other than your hand cost {2} less to cast.",
    }),
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "choose-random-card",
            zone: "graveyard",
            then: { kind: "exile", target: 0, mayCast: { duration: "end-of-turn", play: true } },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your first main phase, mill a card, then exile a card from your graveyard at random. You may play the exiled card this turn.",
    },
    atLevel(2, {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "Whenever one or more cards leave your graveyard, this Class deals 2 damage to each opponent.",
    }),
  ],
  activated: [classLevel(2, "{1}{R}"), classLevel(3, "{1}{R}")],
});
