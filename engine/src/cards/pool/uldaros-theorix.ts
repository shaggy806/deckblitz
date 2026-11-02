import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const TEXT =
  "When Uldaros Theorix enters, if you cast him, exile up to one target nonland card of each card type from your graveyard. Copy those cards. You may cast any number of spells with total mana value 6 or less from among the copies without paying their mana costs. (Permanent spells cast this way become tokens.)";

/** Every nonland card type. One instance of "target", so one card fills one
 * slot however many types it has (rule 115.3). */
const TYPES = ["artifact", "battle", "creature", "enchantment", "instant", "kindred", "planeswalker", "sorcery"] as const;

const slots: readonly TargetSpec[] = TYPES.map((type, i) => {
  const card: TargetSpec = { kind: "card-in-graveyard", whose: "you", filter: { type, notTypes: ["land"] } };
  const earlier = Array.from({ length: i }, (_, slot) => slot);
  return { kind: "optional", of: i === 0 ? card : { kind: "other", of: card, than: { slots: earlier } } };
});

export default defineCard({
  name: "Uldaros Theorix",
  manaCost: "{3}{U}{B}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: slots,
      effect: {
        kind: "sequence",
        effects: [
          ...TYPES.map((_, target) => ({ kind: "exile", target }) as const),
          { kind: "cast-now", from: "exiled-this-way", copies: 1, repeat: true, totalManaValue: 6, free: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
