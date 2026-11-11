import { defineCard } from "../define.js";
import type { Keyword, StaticAbility } from "../define.js";

// EDHREC rank 5438. "Choose two abilities from among first strike, vigilance,
// and lifelink" is a choice of one of the three pairs there are.
const CHOOSE_TEXT =
  "As Greymond, Avacyn's Stalwart enters, choose two abilities from among first strike, vigilance, and lifelink.";
const GRANT_TEXT = "Humans you control have each of the chosen abilities.";
const ANTHEM_TEXT = "As long as you control four or more Humans, Humans you control get +2/+2.";

const PAIRS = {
  "first strike and vigilance": ["first-strike", "vigilance"],
  "first strike and lifelink": ["first-strike", "lifelink"],
  "vigilance and lifelink": ["vigilance", "lifelink"],
} as const satisfies Record<string, readonly Keyword[]>;

const HUMANS = { scope: "creatures-you-control", subtype: "Human" } as const;

const chosen = (value: keyof typeof PAIRS): StaticAbility => ({
  affects: HUMANS,
  condition: { kind: "chosen-on-enter", value },
  grantKeywords: PAIRS[value],
  text: GRANT_TEXT,
});

export default defineCard({
  name: "Greymond, Avacyn's Stalwart",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  text: `${CHOOSE_TEXT}\n${GRANT_TEXT}\n${ANTHEM_TEXT}`,
  chooseOnEnter: ["first strike and vigilance", "first strike and lifelink", "vigilance and lifelink"],
  static: [
    chosen("first strike and vigilance"),
    chosen("first strike and lifelink"),
    chosen("vigilance and lifelink"),
    {
      affects: HUMANS,
      condition: { kind: "controls", filter: { subtype: "Human" }, atLeast: 4, countsSelf: true },
      grantPt: [2, 2],
      text: ANTHEM_TEXT,
    },
  ],
});
