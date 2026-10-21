/**
 * Mutate (rule 702.140) and merged permanents (rule 730): a mutating
 * creature spell merges with its target on top or underneath; the result is
 * the same object with the top card's characteristics and every card's
 * abilities; an illegal target makes it an ordinary creature spell; a merged
 * permanent leaving the battlefield comes apart into its cards.
 * Ikoria (batch 117).
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import {
  B,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const ON_TOP = 0;
const UNDER = 1;

describe("casting for mutate", () => {
  it("merges on top: the top card's characteristics, every card's abilities, the same object", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const stint = game.state.objects[bears].zoneChangeCount;
    lands(game, "Forest", 4);
    const recluse = toHand(game, "Glowstone Recluse");
    pickModes(a, ON_TOP);
    cast(game, recluse, { overload: true, targets: [ref(bears)] });
    expect(game.state.objects[recluse]).toBeUndefined();
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].zoneChangeCount).toBe(stint);
    expect(printedCardName(game.state.objects[bears])).toBe("Glowstone Recluse");
    // 2/3, and its own "whenever this creature mutates" put two counters on it.
    expect(counters(game, bears)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(game.state.objects[bears].summoningSick).toBe(false);
  });

  it("merges underneath: the target's characteristics, with the mutating card's abilities", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    pickModes(a, UNDER);
    cast(game, toHand(game, "Glowstone Recluse"), { overload: true, targets: [ref(bears)] });
    expect(printedCardName(game.state.objects[bears])).toBe("Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("reach")).toBe(true);
  });

  it("with its target gone, it resolves as an ordinary creature spell (702.140b)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const recluse = toHand(game, "Glowstone Recluse");
    cast(game, recluse, { overload: true, targets: [ref(bears)], settle: false });
    destroy(game, bears);
    expect(zone(game, recluse)).toBe("battlefield");
    expect(pt(game, recluse)).toEqual({ power: 2, toughness: 3 });
    expect(counters(game, recluse)).toBe(0);
  });

  it("targets only a non-Human creature with the same owner", () => {
    const { game } = table();
    const human = spawn(game, "Abbey Matron");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    const recluse = toHand(game, "Glowstone Recluse");
    expect(() => cast(game, recluse, { overload: true, targets: [ref(human)] })).toThrow();
    expect(() => cast(game, recluse, { overload: true, targets: [ref(theirs)] })).toThrow();
  });
});

describe("a merged permanent", () => {
  it("leaving the battlefield, comes apart into its cards (730.3)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Glowstone Recluse"), { overload: true, targets: [ref(bears)] });
    destroy(game, bears);
    const names = graveyard(game).map((id) => game.state.objects[id].cardName).sort();
    expect(names).toEqual(["Glowstone Recluse", "Grizzly Bears"]);
  });

  it("mutating again, every card's \"whenever this creature mutates\" triggers", () => {
    const { game, a } = table();
    const egg = spawn(game, "Mysterious Egg");
    lands(game, "Forest", 4);
    lands(game, "Island", 4);
    pickModes(a, UNDER);
    cast(game, toHand(game, "Glowstone Recluse"), { overload: true, targets: [ref(egg)] });
    // The Egg's +1 and the Recluse's +2.
    expect(counters(game, egg)).toBe(3);
    const before = hand(game).length;
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Dreamtail Heron"), { overload: true, targets: [ref(egg)] });
    expect(counters(game, egg)).toBe(6);
    expect(hand(game).length).toBe(before + 1); // the Heron came from the hand, then drew one
    expect(printedCardName(game.state.objects[egg])).toBe("Dreamtail Heron");
  });

  it("counts the times it has mutated", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Porcuparrot"), { overload: true, targets: [ref(bears)] });
    pickTargets(a, B);
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(19);
  });
});
