import { defineCard } from "../define.js";

// EDHREC rank 22684.

/** Its token comes from exile: "when the last time counter is removed from
 * this card while it's exiled" works while it's suspended (`whileSuspended`),
 * beside suspend's own cast trigger, however the last one came off. */
export default defineCard({
  name: "Riftmarked Knight",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Protection from black; flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\nSuspend 3—{1}{W}{W}\nWhen the last time counter is removed from this card while it's exiled, create a 2/2 black Knight creature token with flanking, protection from white, and haste.",
  suspend: { n: 3, cost: "{1}{W}{W}" },
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "Flanking",
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", last: true },
      whileSuspended: true,
      targets: [],
      effect: {
        kind: "create-token",
        token: "2/2 Black Knight Token (Flanking, Protection from White, Haste)",
        count: 1,
      },
      resolve: null,
      text: "When the last time counter is removed from this card while it's exiled, create a 2/2 black Knight creature token with flanking, protection from white, and haste.",
    },
  ],
});
