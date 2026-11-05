import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Augusta attacks, each player exiles a card from their graveyard. When one or more nonland cards are exiled this way, put that many +1/+1 counters on target attacking creature.";

/** Each player chooses in turn order, knowing the choices before theirs (its
 * ruling). The reflexive ability targets as it triggers, carrying the count
 * of nonland cards exiled. */
export default defineCard({
  name: "Augusta, Order Returned",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Advisor"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-player",
            effect: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "graveyard",
              min: 1,
              max: 1,
              destination: "exile",
              unlinked: true,
              leftover: "stay",
            },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { notTypes: ["land"] }, atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
              value: { thisWay: "exiled", filter: { notTypes: ["land"] } },
              effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { triggerValue: true } },
              text: "When one or more nonland cards are exiled this way, put that many +1/+1 counters on target attacking creature.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
