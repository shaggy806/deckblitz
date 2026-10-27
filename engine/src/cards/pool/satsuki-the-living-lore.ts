import { defineCard } from "../define.js";

// EDHREC rank 4661. A lore counter put by an effect fires the chapter it
// reaches (rule 714.2c); one past the final chapter fires nothing (the
// ruling). "Choose up to one" is a modal trigger with no minimum.

const TAP_TEXT = "{T}: Put a lore counter on each Saga you control. Activate only as a sorcery.";
const DIES_TEXT = "When Satsuki dies, choose up to one —";
const BOUNCE_MODE = "Return target Saga or enchantment creature you control to its owner's hand.";
const RETURN_MODE = "Return target Saga card from your graveyard to your hand.";

export default defineCard({
  name: "Satsuki, the Living Lore",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 3,
  text: `${TAP_TEXT}\n${DIES_TEXT}\n• ${BOUNCE_MODE}\n• ${RETURN_MODE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Saga", controlledBy: "you" },
        counter: "lore",
        amount: 1,
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: 1,
        modes: [
          {
            text: BOUNCE_MODE,
            targets: [
              {
                kind: "permanent",
                whose: "you",
                filter: { anyOf: [{ subtype: "Saga" }, { types: ["enchantment", "creature"] }] },
              },
            ],
            effect: { kind: "return-to-hand", target: 0 },
          },
          {
            text: RETURN_MODE,
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Saga" } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
        ],
      },
      resolve: null,
      text: `${DIES_TEXT} ${BOUNCE_MODE} ${RETURN_MODE}`,
    },
  ],
});
