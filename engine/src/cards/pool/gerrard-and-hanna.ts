import { defineCard } from "../define.js";

// Playtest card. The mode is chosen as the trigger goes on the stack (rule 700.2b), so the
// opponent's target and the life gain ride in each mode, ahead of that mode's own effect.

const HEAD =
  "Whenever Gerrard and Hanna attacks, you gain 1 life for each card in target opponent's hand. Then, choose one —";
const RETURN = "Return target artifact or enchantment card from your graveyard to your hand.";
const TAP = "Tap up to one target creature.";
const GAIN = { kind: "gain-life", amount: { cardsInHand: { target: 0 } } } as const;

export default defineCard({
  name: "Gerrard and Hanna",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Artificer"],
  power: 3,
  toughness: 4,
  text: `${HEAD}\n• ${RETURN}\n• ${TAP}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: RETURN,
            targets: [
              "opponent",
              { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "enchantment"] } },
            ],
            effect: {
              kind: "sequence",
              effects: [GAIN, { kind: "return-to-hand", target: 1, from: "graveyard" }],
            },
          },
          {
            text: TAP,
            targets: ["opponent", { kind: "optional", of: "creature" }],
            effect: { kind: "sequence", effects: [GAIN, { kind: "tap", target: 1 }] },
          },
        ],
      },
      resolve: null,
      text: HEAD,
    },
  ],
});
