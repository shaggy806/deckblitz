import { defineCard } from "../define.js";

const TEXT =
  "Domain — Whenever Nael deals combat damage to a player, look at the top X cards of your library, where X is the number of basic land types among lands you control. Put up to one of them on top of your library and the rest on the bottom in a random order. Then if there are five basic land types among lands you control, draw a card.";

const controlsA = (subtype: string) =>
  ({ kind: "controls", filter: { type: "land", subtype }, atLeast: 1 }) as const;

export default defineCard({
  name: "Nael, Avizoa Aeronaut",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: { basicLandTypes: "you" },
            min: 0,
            max: 1,
            destination: "library-top",
            leftover: "bottom-random",
          },
          {
            // "Five basic land types among lands you control" is a land of
            // each of the five types.
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                controlsA("Plains"),
                controlsA("Island"),
                controlsA("Swamp"),
                controlsA("Mountain"),
                controlsA("Forest"),
              ],
            },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
