import { defineCard } from "../define.js";

const ENTER_TEXT = "When Vanille enters, mill two cards, then return a permanent card from your graveyard to your hand.";
const MELD_TEXT =
  "At the beginning of your first main phase, if you both own and control Vanille and a creature named Fang, Fearless l'Cie, you may pay {3}{B}{G}. If you do, exile them, then meld them into Ragnarok, Divine Deliverance.";
const FANG = { name: "Fang, Fearless l'Cie", type: "creature" } as const;

export default defineCard({
  name: "Vanille, Cheerful l'Cie",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  meldCard: true,
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${MELD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { notTypes: ["instant", "sorcery"] },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      condition: { kind: "meld-ready", partner: FANG },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3}{B}{G} to meld Vanille and Fang into Ragnarok, Divine Deliverance?",
        cost: "{3}{B}{G}",
        effect: { kind: "meld", partner: FANG, into: "Ragnarok, Divine Deliverance" },
      },
      resolve: null,
      text: MELD_TEXT,
    },
  ],
});
