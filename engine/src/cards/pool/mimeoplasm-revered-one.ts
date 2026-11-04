import { defineCard } from "../define.js";

const ENTER_TEXT =
  "As Mimeoplasm enters, exile up to X creature cards from your graveyard. It enters with three +1/+1 counters on it for each creature card exiled this way.";
const COPY_TEXT = "{2}: Mimeoplasm becomes a copy of target creature card exiled with it, except it's 0/0 and has this ability.";

export default defineCard({
  name: "Mimeoplasm, Revered One",
  manaCost: "{X}{B}{G}{U}",
  colors: ["B", "G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { exile: { filter: { type: "creature" }, count: "x", upTo: true } },
        counters: { kind: "+1/+1", amount: "done-as-enters", eachDone: 3 },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-exile", linked: true, filter: { type: "creature" } }],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        ofCard: true,
        exceptions: { basePt: [0, 0], thisAbility: { card: "Mimeoplasm, Revered One", activated: 0 } },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
