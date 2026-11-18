import { defineCard } from "../define.js";
import { crew, crewText, investigate } from "../helpers.js";

// Rulings:
//   Starting with the player whose turn it is, each player in turn order chooses two nontoken,
//   non-Vehicle creatures they control, then all the creatures chosen by all players are exiled at
//   the same time. Players get to know the choices made by players who chose before them.
//   If Foreboding Steamboat leaves the battlefield before its first triggered ability resolves,
//   the chosen creatures won't be exiled at all.
//
// The choice is a `vote` with `choose` (rule 101.4: the active player first), every chosen
// creature then exiled in one event until this leaves (rule 610.3). The attack trigger's card
// is one of those, still linked to this stint (rule 607.2a).

const ENTER_TEXT =
  "When this Vehicle enters, each player chooses two nontoken, non-Vehicle creatures they control. Exile them until this Vehicle leaves the battlefield.";
const ATTACK_TEXT =
  "Whenever this Vehicle attacks, put a card exiled with it into its owner's graveyard. If you do, investigate.";

export default defineCard({
  name: "Foreboding Steamboat",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 7,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}\n${crewText(2)}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            for: {
              permanent: { type: "creature", token: false, notSubtypes: ["Vehicle"], controlledBy: "you" },
              own: true,
              count: 2,
              prompt: "Choose two nontoken, non-Vehicle creatures you control to exile",
            },
          },
          { kind: "exile-all", filter: { thisWay: "chosen" }, untilSourceLeaves: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
        then: {
          kind: "conditional",
          condition: { kind: "this-way", what: "put-into-graveyard" },
          then: investigate(),
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [crew(2, crewText(2))],
});
