import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const REWRITE =
  "Rewrite the Past — Return one or two target creature and/or Spacecraft cards from your graveyard to your hand.";
const REPAIR =
  "Repair the Timeline — Target opponent reveals their hand. You choose a nonland card from it. Exile that card.";
const card: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] },
};

export default defineCard({
  name: "Stray from History",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${REWRITE}\n• ${REPAIR}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: REWRITE,
        targets: [card, { kind: "optional", of: { kind: "other", of: card, than: { slot: 0 } } }],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            { kind: "return-to-hand", target: 1, from: "graveyard" },
          ],
        },
      },
      {
        text: REPAIR,
        targets: ["opponent"],
        effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      },
    ],
  },
});
