import { defineCard } from "../define.js";

const WHEN_PAID = "When you pay this cost one or more times, choose up to that many —";
const ETB_TEXT = `When this creature enters, you may pay {G} up to three times. ${WHEN_PAID}`;
const DESTROY = "Destroy target artifact or enchantment.";
const EXILE = "Exile target player's graveyard.";
const LIFE = "You gain 4 life.";

// The modes are the reflexive ability's, chosen as it goes on the stack and
// bringing their targets with them (rules 603.12, 603.3c, 700.2).
export default defineCard({
  name: "Tranquil Frillback",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n• ${DESTROY}\n• ${EXILE}\n• ${LIFE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G} up to three times?",
        cost: "{G}",
        costTimes: true,
        maxX: 3,
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "modal",
            announced: true,
            minModes: 0,
            maxModes: "x",
            modes: [
              {
                text: DESTROY,
                targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
                effect: { kind: "destroy", target: 0 },
              },
              { text: EXILE, targets: ["player"], effect: { kind: "exile-graveyard", target: 0 } },
              { text: LIFE, effect: { kind: "gain-life", amount: 4 } },
            ],
          },
          text: `${WHEN_PAID} ${DESTROY} ${EXILE} ${LIFE}`,
        },
      },
      resolve: null,
      text: `${ETB_TEXT} ${DESTROY} ${EXILE} ${LIFE}`,
    },
  ],
});
