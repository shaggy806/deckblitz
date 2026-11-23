import { defineCard } from "../define.js";

// Playtest card. The mode count is read as the trigger goes on the stack (rule 700.2b): one mode,
// or any number of them while some opponent has at least 5 more life than you.

const HEAD =
  "When this creature enters, choose one. If an opponent has at least 5 more life than you, choose any number instead—";
const COUNTERS = "Put two +1/+1 counters on another target creature or Vehicle.";
const RETURN = "Return target artifact card from your graveyard to your hand.";
const LOOK =
  "Look at the top five cards of your library. Reveal an artifact card from among them and put it into your hand. Put the rest on the bottom in a random order.";

export default defineCard({
  name: "Catch-Up Mechanic",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 4,
  toughness: 4,
  text: `${HEAD}\n• ${COUNTERS}\n• ${RETURN}\n• ${LOOK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: {
          ifCondition: {
            kind: "amounts",
            left: { amongPlayers: "greatest", of: { lifeTotal: "each" }, who: "each-opponent" },
            op: "gte",
            right: { sum: [{ lifeTotal: "you" }, 5] },
          },
          then: 3,
          else: 1,
        },
        modes: [
          {
            text: COUNTERS,
            targets: [
              {
                kind: "other",
                of: { kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
              },
            ],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          },
          {
            text: RETURN,
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          {
            text: LOOK,
            targets: [],
            effect: {
              kind: "look-and-choose",
              zone: "library",
              count: 5,
              reveal: "chosen",
              min: 1,
              max: 1,
              filter: { type: "artifact" },
              destination: "hand",
              leftover: "bottom-random",
            },
          },
        ],
      },
      resolve: null,
      text: HEAD,
    },
  ],
});
