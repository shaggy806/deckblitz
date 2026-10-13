import { defineCard } from "../define.js";

/**
 * Ozox, the Clattering King's death token — "Jumblebones, a legendary 2/1
 * black Skeleton creature token with 'Jumblebones can't block' and 'When
 * Jumblebones leaves the battlefield, return target card named Ozox, the
 * Clattering King from your graveyard to your hand.'"
 *
 * A named legendary token like Cragflame, so the legend rule applies to two
 * of them. "Your graveyard" is the graveyard of the token's controller as the
 * ability triggers; the Ozox there is targeted, so with none the ability is
 * removed from the stack (rule 603.3d).
 */
const CANT_BLOCK_TEXT = "Jumblebones can't block.";
const RETURN_TEXT =
  "When Jumblebones leaves the battlefield, return target card named Ozox, the Clattering King from your graveyard to your hand.";

export default defineCard({
  name: "Jumblebones",
  supertypes: ["legendary"],
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 2,
  toughness: 1,
  text: `${CANT_BLOCK_TEXT}\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: CANT_BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { name: "Ozox, the Clattering King" } },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
