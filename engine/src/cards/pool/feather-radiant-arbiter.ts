import { defineCard } from "../define.js";

// Any number of other creatures, anyone's, as many as can be paid for; none is
// the "may". The copies are yours in the order chosen. A copy of a permanent
// spell becomes a token (rule 707.10f).

const TEXT =
  "Whenever you cast a noncreature spell that targets only Feather, you may choose any number of other creatures that spell could target and pay {2} for each of those creatures. If you do, for each of those creatures, copy that spell. The copy targets that creature. (Copies of permanent spells become tokens.)";

export default defineCard({
  name: "Feather, Radiant Arbiter",
  manaCost: "{R}{W}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { notTypes: ["creature"], targets: { only: true, source: true } },
      },
      targets: [],
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        forEachItCouldTarget: { filter: { type: "creature" }, other: true, chooseAndPayEach: "{2}" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
