import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 6252.
//
// Rulings:
//   [2023-11-10] You must control three or more creatures with different powers at the time the
//     coven ability triggers and at the time the ability tries to resolve. They do not, however,
//     need to be the same set of creatures in both cases.
//
// "Enters or attacks" is two triggers sharing one intervening-if and effect;
// the return is mandatory (no "may") and the card enters under your control.
const TEXT =
  "Coven — Whenever this creature enters or attacks, if you control three or more creatures with different powers, return target permanent card with mana value 3 or less from your graveyard to the battlefield.";

const RETURN: Omit<TriggeredAbility, "trigger"> = {
  condition: { kind: "coven" },
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
  resolve: null,
  text: TEXT,
};

export default defineCard({
  name: "Redemption Choir",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...RETURN },
    { trigger: { on: "attacks", who: "self" }, ...RETURN },
  ],
});
