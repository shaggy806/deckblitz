/**
 * Star Trek Commander (TRC) — completing the set after its release
 * (author-by-set, batch 2): the cards an earlier batch left blocked, each on
 * the clause that blocked it.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, destroy, enter, hand, keywords, lands, pickTargets, ref, settle, spawn, subtypes, table, toHand, toStep, tokensNamed, types, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(game.state.objects[id].controller, { kind: "add-counter", target: 0, counter, amount }, [
    ref(id),
  ]);

describe("La Forge, Thoughtful as Ever", () => {
  it("makes a Faerie for each permanent you've put a counter on this turn, not each counter", () => {
    const { game } = table();
    const laForge = spawn(game, "La Forge, Thoughtful as Ever");
    const bears = spawn(game, "Grizzly Bears");
    const relic = spawn(game, "Darksteel Relic");
    spawn(game, "Hill Giant"); // no counter
    addCounters(game, bears, "+1/+1", 3);
    addCounters(game, relic, "charge", 1);
    activate(game, laForge);
    expect(tokensNamed(game, "Faerie Token")).toBe(2);
  });
});

describe("The Guardian of Forever", () => {
  it("returns the sacrificed card at the beginning of the next end step", () => {
    const { game, a } = table();
    const guardian = spawn(game, "The Guardian of Forever");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 4);
    a.chooseSacrificesFn = () => [bears];
    activate(game, guardian, 0, { sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("T'Pring, Never Parted", () => {
  it("has the chosen creatures fight, and draws for each that dies this turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant"); // 3/3
    const bears = spawn(game, "Grizzly Bears", B); // 2/2: dies
    pickTargets(a, giant, bears);
    a.chooseModesFn = (_view, _min, max) => Array.from({ length: max }, (_, i) => i);
    const before = hand(game).length;
    enter(game, "T'Pring, Never Parted");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
    destroy(game, giant); // it fought: its death this turn draws too
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("The Best of Both Worlds", () => {
  it("assimilates a creature, then III blinks that Borg back to its owner", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = enter(game, "The Best of Both Worlds");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(subtypes(game, bears)).toEqual(["Borg"]);
    expect(types(game, bears)).toContain("artifact");
    expect(counters(game, bears, "+1/+1")).toBe(1);
    game.state.objects[saga].counters.lore = 2;
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    expect(subtypes(game, bears)).toEqual(["Bear"]);
    expect(counters(game, bears, "+1/+1")).toBe(0);
  });
});

describe("U.S.S. Farragut, Bold Explorer", () => {
  it("puts a creature in with haste on landfall, bottoms it at the end step and draws", () => {
    const { game, a } = table();
    spawn(game, "U.S.S. Farragut, Bold Explorer");
    const giant = toHand(game, "Hill Giant");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === giant);
    const forest = toHand(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(keywords(game, giant)).toContain("haste");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.at(-1)).toBe(giant);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Chief Montgomery Scott", () => {
  it("puts a creature in with X +1/+1 counters, a Spacecraft with X charge counters", () => {
    const { game, a } = table();
    const scott = spawn(game, "Chief Montgomery Scott");
    lands(game, "Forest", 3);
    lands(game, "Island", 3); // two names: X = 2
    const bears = toHand(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === bears);
    activate(game, scott);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "+1/+1")).toBe(2);
    expect(counters(game, bears, "charge")).toBe(0);
  });

  it("gives a Spacecraft charge counters, not +1/+1 counters", () => {
    const { game, a } = table();
    const scott = spawn(game, "Chief Montgomery Scott");
    lands(game, "Forest", 3);
    lands(game, "Island", 2);
    spawn(game, "Plains"); // three names: X = 3
    const sphere = toHand(game, "Borg Scout Sphere");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === sphere);
    activate(game, scott);
    expect(zone(game, sphere)).toBe("battlefield");
    expect(counters(game, sphere, "charge")).toBe(3);
    expect(counters(game, sphere, "+1/+1")).toBe(0);
  });
});
