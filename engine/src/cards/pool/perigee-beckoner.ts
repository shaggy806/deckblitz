import { defineCard } from "../define.js";

// EDHREC rank 13156.
//
// Supernatural Stamina's grant on an enters trigger; "another" keeps the
// Beckoner itself out of the slot.

const RETURN_TEXT = "When this creature dies, return it to the battlefield tapped under its owner's control.";
const ETB_TEXT = `When this creature enters, until end of turn, another target creature you control gets +2/+0 and gains "${RETURN_TEXT}"`;
const WARP_TEXT =
  "Warp {1}{B} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)";

export default defineCard({
  name: "Perigee Beckoner",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 5,
  text: `${ETB_TEXT}\n${WARP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "dies", who: "self" },
              targets: [],
              effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
              resolve: null,
              text: RETURN_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  warp: { cost: "{1}{B}" },
});
