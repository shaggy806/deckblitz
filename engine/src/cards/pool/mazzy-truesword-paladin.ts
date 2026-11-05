import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever an enchanted creature attacks one of your opponents, it gets +2/+0 and gains trample until end of turn.";
const AURA_TEXT =
  "Whenever an Aura you control is put into your graveyard from the battlefield, exile it. Until the end of your next turn, you may cast that card.";

export default defineCard({
  name: "Mazzy, Truesword Paladin",
  manaCost: "{1}{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Knight"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${AURA_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "attacks",
        who: "any",
        filter: { type: "creature", enchanted: true, attackingOpponent: true },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      // Your graveyard: an Aura you control that you own (one you don't own
      // goes to its owner's graveyard).
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { subtype: "Aura", ownedBy: "you" },
        to: ["graveyard"],
      },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", mayCast: { duration: "your-next-turn" } },
      resolve: null,
      text: AURA_TEXT,
    },
  ],
});
