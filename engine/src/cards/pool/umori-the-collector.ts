import { CARD_TYPE_CHOICES } from "../../effects.js";
import type { CardType } from "../define.js";
import { defineCard } from "../define.js";

// Cloud Key's shape over every card type (Serra's Emissary's menu): one cost reduction per
// type, live only for the one chosen.

const REDUCE_TEXT = "Spells you cast of the chosen type cost {1} less to cast.";

const reduction = (type: CardType) => ({
  affects: { scope: "self" } as const,
  condition: { kind: "chosen-on-enter", value: type } as const,
  costModification: { applies: { type }, caster: "you", reduceGeneric: 1 } as const,
  text: REDUCE_TEXT,
});

export default defineCard({
  name: "Umori, the Collector",
  manaCost: "{2}{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 4,
  toughness: 5,
  text:
    "Companion — Each nonland card in your starting deck shares a card type. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\n" +
    `As Umori enters, choose a card type.\n${REDUCE_TEXT}`,
  companion: { kind: "shared-card-type", of: "nonland" },
  chooseOnEnter: [...CARD_TYPE_CHOICES],
  static: CARD_TYPE_CHOICES.map(reduction),
});
