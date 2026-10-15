import { defineCard } from "../define.js";

// EDHREC rank 9102. Kicked, putting the card onto the battlefield tapped
// replaces returning it to the hand (Aang's Journey's `kicker.effect` shape);
// the target is the same either way.
export default defineCard({
  name: "Zuko's Conviction",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker {4} (You may pay an additional {4} as you cast this spell.)\nReturn target creature card from your graveyard to your hand. If this spell was kicked, instead put that card onto the battlefield tapped.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  kicker: {
    cost: "{4}",
    effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
  },
});
