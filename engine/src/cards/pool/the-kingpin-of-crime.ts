import { defineCard } from "../define.js";

// "Until end of turn, creatures you control with toughness greater than their
// power assign combat damage equal to their toughness" is a timed static: a
// rule about how combat damage is assigned, not a change of characteristics,
// so it reaches creatures that come under your control later in the turn too
// (rule 611.2c), and each creature's toughness and power are compared as its
// damage is sized (rule 510.1a).
export default defineCard({
  name: "The Kingpin of Crime",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Villain"],
  power: 1,
  toughness: 5,
  text:
    "Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)\n" +
    "Whenever you attack, you may pay 2 life. If you do, until end of turn, creatures you control with toughness " +
    "greater than their power assign combat damage equal to their toughness rather than their power.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W/B} to extort?",
        cost: "{W/B}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 1, who: "each-opponent" },
            { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
          ],
        },
      },
      resolve: null,
      text: "Extort",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 2 life so your creatures with toughness greater than power assign combat damage by toughness?",
        costLife: 2,
        effect: {
          kind: "timed-static",
          duration: "end-of-turn",
          text:
            "Until end of turn, creatures you control with toughness greater than their power assign combat damage " +
            "equal to their toughness rather than their power.",
          static: [
            {
              affects: { scope: "creatures-you-control" },
              combatDamageByToughness: "if-toughness-greater",
              text:
                "Creatures you control with toughness greater than their power assign combat damage equal to their " +
                "toughness rather than their power.",
            },
          ],
        },
      },
      resolve: null,
      text:
        "Whenever you attack, you may pay 2 life. If you do, until end of turn, creatures you control with toughness " +
        "greater than their power assign combat damage equal to their toughness rather than their power.",
    },
  ],
});
