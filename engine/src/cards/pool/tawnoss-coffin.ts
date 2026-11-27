import { defineCard } from "../define.js";

// A `flicker` of the creature `withAuras`, its return a delayed "when this
// artifact leaves the battlefield or becomes untapped" (The Pandorica's
// watch), tapped and with the counters it had (`keepCounters`). The rulings:
// it returns tapped as it enters, a token or an Aura that can't enchant it any
// more stays exiled, and the Coffin gone before the ability resolves leaves
// the creature exiled forever (nothing watches it).

const NO_UNTAP = "You may choose not to untap this artifact during your untap step.";
const RETURN =
  "When this artifact leaves the battlefield or becomes untapped, return that exiled card to the battlefield under its owner's control tapped with the noted number and kind of counters on it. If you do, return the other exiled cards to the battlefield under their owner's control attached to that permanent.";
const COFFIN = `{3}, {T}: Exile target creature and all Auras attached to it. Note the number and kind of counters that were on that creature. ${RETURN}`;

export default defineCard({
  name: "Tawnos's Coffin",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${NO_UNTAP}\n${COFFIN}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: NO_UNTAP }],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "flicker",
        target: 0,
        withAuras: true,
        keepCounters: true,
        tapped: true,
        returnAt: {
          whenever: { on: "event", event: "becomes-untapped", who: "self" },
          watching: "source",
          until: "permanent",
          once: true,
          orLeaves: "source",
        },
        returnText: RETURN,
      },
      resolve: null,
      text: COFFIN,
    },
  ],
});
