import { defineCard } from "../define.js";

// EDHREC rank 28508.

const SCOUT_TEXT =
  '{1}: If Nog is a Rogue, he becomes a Ferengi Scout with base power and toughness 3/4 and gains "Whenever Nog becomes tapped, surveil 2."';
const OFFICER_TEXT =
  '{3}: If Nog is a Scout, he becomes a Ferengi Officer and gains "You may play lands from your graveyard" and "You may play an additional land on each of your turns."';
const SURVEIL_TEXT = "Whenever Nog becomes tapped, surveil 2.";

// "Becomes a Ferengi Scout" sets his creature types (rule 205.1a), for as
// long as he stays (no duration). The extra land drop is read from his
// granted statics as well as printed ones.
export default defineCard({
  name: "Nog, Ambitious Cadet",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ferengi", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${SCOUT_TEXT}\n${OFFICER_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Rogue" } },
        then: {
          kind: "become",
          target: "source",
          setSubtypes: ["Ferengi", "Scout"],
          power: 3,
          toughness: 4,
          triggered: [
            {
              trigger: { on: "becomes-tapped", who: "self" },
              targets: [],
              effect: { kind: "surveil", amount: 2 },
              resolve: null,
              text: SURVEIL_TEXT,
            },
          ],
          duration: "permanent",
        },
      },
      resolve: null,
      text: SCOUT_TEXT,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Scout" } },
        then: {
          kind: "become",
          target: "source",
          setSubtypes: ["Ferengi", "Officer"],
          static: [
            {
              affects: { scope: "self" },
              mayPlay: { from: "graveyard", play: true, filter: { type: "land" } },
              text: "You may play lands from your graveyard.",
            },
            {
              affects: { scope: "self" },
              extraLandsPerTurn: 1,
              text: "You may play an additional land on each of your turns.",
            },
          ],
          duration: "permanent",
        },
      },
      resolve: null,
      text: OFFICER_TEXT,
    },
  ],
});
