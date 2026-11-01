import { defineCard } from "../define.js";
import { EVERY_CARD_TYPE } from "../../zone-choice-together.js";

// Not targeted: chosen as the ability resolves, from the defending player's
// graveyard, a slot per card type (the ruling lists them; rule 205.2a). A card
// with two types fills either slot, and another may fill the other. It links
// to no other ability, so the exile is `unlinked`.
const TEXT =
  "Whenever this creature attacks, exile up to one card of each card type from defending player's graveyard. Put a " +
  "+1/+1 counter on this creature for each card exiled this way.";

export default defineCard({
  name: "Grime Gorger",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            from: "trigger-player",
            zone: "graveyard",
            min: 0,
            max: EVERY_CARD_TYPE.length,
            together: {
              oneEach: EVERY_CARD_TYPE.map((type) => ({
                label: `${/^[aeiou]/.test(type) ? "an" : "a"} ${type} card`,
                filter: { type },
              })),
              text: "up to one card of each card type",
            },
            destination: "exile",
            unlinked: true,
            leftover: "stay",
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { thisWay: "exiled" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
