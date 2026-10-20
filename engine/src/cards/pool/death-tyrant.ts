import { defineCard } from "../define.js";

// EDHREC rank 8862. "Negative Energy Cone" is an ability word: flavor only.
//
// One dies trigger over either kind of creature: an attacking creature you
// control, or a blocking creature an opponent controls — each read as it
// last existed on the battlefield (rule 603.10a).

const CONE_TEXT =
  "Negative Energy Cone — Whenever an attacking creature you control or a blocking creature an opponent controls dies, create a 2/2 black Zombie creature token.";
const RETURN_TEXT = "{5}{B}: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Death Tyrant",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beholder", "Skeleton"],
  power: 4,
  toughness: 6,
  keywords: ["menace"],
  text: `Menace\n${CONE_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: {
          type: "creature",
          anyOf: [
            { attacking: true, controlledBy: "you" },
            { blocking: true, controlledBy: "opponent" },
          ],
        },
      },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: CONE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
