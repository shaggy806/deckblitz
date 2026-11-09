import { defineCard } from "../define.js";

// EDHREC rank 2049. Landfall, with a Plains the card may go to the battlefield
// instead: asked first (the "instead"), then, or for any other land, the
// return to hand; both are optional.

const TEXT =
  "Landfall — Whenever a land you control enters, you may return target nonland permanent card from your graveyard to your hand. If that land is a Plains, you may return that nonland permanent card to the battlefield instead.";

const TO_HAND = {
  kind: "may",
  prompt: "Return that card to your hand?",
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
} as const;

export default defineCard({
  name: "Emeria Shepherd",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["land", "instant", "sorcery"] } }],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { subtype: "Plains" } },
        then: {
          kind: "may",
          prompt: "Return that card to the battlefield instead of your hand?",
          effect: { kind: "put-onto-battlefield", target: 0 },
          else: TO_HAND,
        },
        else: TO_HAND,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
