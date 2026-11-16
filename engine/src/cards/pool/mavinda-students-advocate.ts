import { defineCard } from "../define.js";

// EDHREC rank 10647. The {0} is a permission on the targeted card for this
// turn (`grant-play`), at the spell's normal timing and costs. "Costs {8}
// more to cast this way" unless it targets a creature you control is the
// permission's `tax` with `unlessTargets`: an increase fixed once the targets
// are chosen (rules 601.2c, 601.2f), so a cast that can't pay the {8} is
// offered only the creatures of yours as targets. Cast another way
// (flashback), it's neither taxed nor exiled.
const TEXT =
  "{0}: You may cast target instant or sorcery card from your graveyard this turn. If that spell doesn't target a creature you control, it costs {8} more to cast this way. If that spell would be put into your graveyard, exile it instead. Activate only once each turn.";

export default defineCard({
  name: "Mavinda, Students' Advocate",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Advisor"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "grant-play",
        cards: 0,
        duration: "end-of-turn",
        exileAfter: true,
        tax: { generic: 8, unlessTargets: { type: "creature", controlledBy: "you" } },
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
