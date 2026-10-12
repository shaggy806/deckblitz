import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

/** The front face of Grub, Storied Matriarch // Grub, Notorious Auntie. "Enters
 * or transforms into" is one ability with two trigger conditions — written as
 * two triggers with one effect (Ashling, Rekindled's shape). */
const RETURN_TEXT =
  "Whenever this creature enters or transforms into Grub, Storied Matriarch, return up to one target Goblin card from your graveyard to your hand.";
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {R}. If you do, transform Grub.";

const RETURN: EffectSpec = { kind: "return-to-hand", target: 0, from: "graveyard" };
const GOBLIN_CARD = { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Goblin" } } } as const;

export default defineCard({
  name: "Grub, Storied Matriarch",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${RETURN_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [GOBLIN_CARD],
      effect: RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "transforms", who: "self", intoFront: true },
      targets: [GOBLIN_CARD],
      effect: RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      // Won't transform her if she has transformed since it triggered (the
      // ruling; rule 701.28f).
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to transform Grub?",
        cost: "{R}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Grub, Storied Matriarch", "Grub, Notorious Auntie"],
  transform: true,
});
