import { defineCard } from "../define.js";

// Top-1000 commander #779; EDHREC rank 13455.
//
// The two creatures are a secret `vote` for a permanent, chosen by you and the
// target opponent (`youAnd`) among that player's creatures (`controlledByRef`),
// neither shown until both are in. Chosen, not targeted: a hexproof creature
// can be picked. Both may pick the same one, which is sacrificed once; the
// sacrifices are one event.

const ENTERS_TEXT =
  "When Malik, Grim Manipulator enters, you and target opponent each secretly choose a creature that player controls. Then those choices are revealed, and that player sacrifices those creatures.";
const TREASURE_TEXT = "Whenever an opponent sacrifices a creature, you create a Treasure token.";

export default defineCard({
  name: "Malik, Grim Manipulator",
  manaCost: "{2}{R}{W}{B}",
  colors: ["R", "W", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${TREASURE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            secret: true,
            who: { youAnd: { target: 0 } },
            for: { permanent: { type: "creature", controlledByRef: { target: 0 } } },
          },
          {
            kind: "for-each-voted",
            which: "voted",
            simultaneous: true,
            effect: { kind: "sacrifice-target", target: 0, byItsController: true },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
