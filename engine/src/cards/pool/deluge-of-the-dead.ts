import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, create two 2/2 black Zombie creature tokens.";
const EXILE_TEXT =
  "{2}{B}: Exile target card from a graveyard. If it was a creature card, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Deluge of the Dead",
  art: "https://cards.scryfall.io/art_crop/back/3/7/370412b1-85ec-42a9-90fe-c35a6249e149.jpg",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            // "If it was a creature card" — General's Enforcer's shape: the
            // filter reads printed characteristics, unchanged by the exile.
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: { kind: "create-token", token: "Zombie Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Innistrad", "Deluge of the Dead"],
  transform: true,
});
