/**
 * Recheck list R6, group D: Heart of Bogardan's "when a player doesn't pay"
 * damage (X from the age counters as it triggers), Demonic Junker's
 * per-player destruction and its "a creature you controlled" counters, and
 * Sinister Gnarlbark's end-step draw and blight.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  counters,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  settle,
  spawn,
  table,
  toStep,
  zone,
} from "./harness.js";

describe("Recheck R6 group D", () => {
  it("Heart of Bogardan, unpaid at two age counters, deals 2 to the target player and each of their creatures", () => {
    const { game, a } = table();
    const heart = spawn(game, "Heart of Bogardan");
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, heart, "age")).toBe(1);
    expect(zone(game, heart)).toBe("battlefield");
    pickModes(a);
    pickTargets(a, B);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, heart)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });

  it("Heart of Bogardan, unpaid at its first counter, deals 0", () => {
    const { game, a } = table();
    const heart = spawn(game, "Heart of Bogardan");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickTargets(a, B);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, heart)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Demonic Junker destroys one creature per player and gets two counters when one was yours", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, mine, theirs);
    const junker = enter(game, "Demonic Junker");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, junker)).toBe(2);
  });

  it("Demonic Junker gets no counters when only an opponent's creature was destroyed", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, null, theirs);
    const junker = enter(game, "Demonic Junker");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, junker)).toBe(0);
  });

  it("Sinister Gnarlbark draws and blights 1 at its controller's end step", () => {
    const { game, a } = table();
    const gnarlbark = spawn(game, "Sinister Gnarlbark");
    const bears = spawn(game, "Grizzly Bears", A);
    pickPermanents(a, bears);
    const before = hand(game, A).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(counters(game, gnarlbark, "-1/-1")).toBe(0);
  });
});
