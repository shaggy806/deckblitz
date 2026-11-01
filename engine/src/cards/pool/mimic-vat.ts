import { defineCard } from "../define.js";

// Imprint links the exiled card to this stint of the Vat (rule 607.2a). "A card
// exiled with this artifact" is read as the second ability resolves, not as it
// is activated (the ruling), and is the Vat's controller's to choose if a melded
// pair put two there (the ruling). A token of an instant or sorcery card is no
// token at all (rule 111.5, the manifest ruling). "It gains haste" is an effect,
// not a copy exception, so a copy of the token has none (rule 707.9).
const IMPRINT_TEXT =
  "Imprint — Whenever a nontoken creature dies, you may exile that card. If you do, return each other card exiled with this artifact to its owner's graveyard.";
const COPY_TEXT =
  "{3}, {T}: Create a token that's a copy of a card exiled with this artifact. It gains haste. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Mimic Vat",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${IMPRINT_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { token: false, type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile that card with Mimic Vat?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object", linked: true },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: { kind: "return-exiled-by-source", linked: "graveyard", others: true },
            },
          ],
        },
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "exiled-with-source",
        chooseOne: true,
        count: 1,
        gains: { keywords: ["haste"] },
        exileAtEndStep: true,
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
