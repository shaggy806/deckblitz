/**
 * A creature's own record of combat, read as a filter clause: what it did this
 * combat (`attackedThisCombat`, with `blockedThisTurn`'s `thisCombat`), this
 * turn against you (`attackedYouThisTurn`), and on its controller's last turn
 * (`attackedDuringControllersLastTurn`). And "a creature is attacking you", the
 * `controls` condition's `anyController` over `attackingYou`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { matchesFilter } from "../filter.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The end of combat step, before anything has resolved there. */
const toEndOfCombat = (game: Game): void =>
  game.advanceUntil((s) => s.turn.step === "end-combat" && s.zones.shared.stack.length > 0);

describe("attacked or blocked this combat", () => {
  it("Kjeldoran Home Guard, attacking: a -0/-1 counter and a Deserter", () => {
    const { game, a } = table();
    const guard = spawn(game, "Kjeldoran Home Guard");
    attack(game, a, [guard]);
    expect(counters(game, guard, "-0/-1")).toBe(1);
    expect(pt(game, guard)).toEqual({ power: 1, toughness: 5 });
    expect(tokensNamed(game, "Deserter Token", A)).toBe(1);
  });

  it("blocking too", () => {
    const { game, a, b } = table();
    const guard = spawn(game, "Kjeldoran Home Guard", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: guard, attacker: bears }];
    attack(game, a, [bears]);
    expect(counters(game, guard, "-0/-1")).toBe(1);
    expect(tokensNamed(game, "Deserter Token", B)).toBe(1);
  });

  it("not if it did neither, or did so in an earlier combat of the turn", () => {
    const { game, a } = table();
    const guard = spawn(game, "Kjeldoran Home Guard");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(counters(game, guard, "-0/-1")).toBe(0);
    expect(tokensNamed(game, "Deserter Token", A)).toBe(0);
  });

  it("holds for one removed from combat since (rule 506.4)", () => {
    const { game, a } = table();
    const guard = spawn(game, "Kjeldoran Home Guard");
    a.declareAttackersFn = () => [{ attacker: guard, defender: B }];
    const labyrinth = spawn(game, "Labyrinth of Skophos", B);
    lands(game, "Plains", 4, B);
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === B);
    activate(game, labyrinth, 1, { player: B, targets: [ref(guard)] });
    expect(game.state.objects[guard].attacking).toBe(null);
    toStep(game, "postcombat-main");
    expect(counters(game, guard, "-0/-1")).toBe(1);
  });

  it("is read as it last was if it has left by the time the ability resolves (rule 603.4)", () => {
    const { game, a } = table();
    const guard = spawn(game, "Kjeldoran Home Guard");
    a.declareAttackersFn = () => [{ attacker: guard, defender: B }];
    toEndOfCombat(game);
    destroy(game, guard);
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Deserter Token", A)).toBe(1);
  });

  it("a new combat this turn starts it afresh", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    const asked = { attackedThisCombat: true } as const;
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    const matches = () => matchesFilter(game.state, registryOf(game), bears, asked, { you: A });
    expect(matches()).toBe(true);
    game.state.turn.combatPhases = (game.state.turn.combatPhases ?? 1) + 1;
    expect(matches()).toBe(false);
  });

  it("Daredevil Dragster: a counter a combat, then at the second it's sacrificed for two cards", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const dragster = spawn(game, "Daredevil Dragster");
    spawn(game, "Hill Giant");
    const crewed = (): void => {
      activate(game, dragster, 0);
    };
    crewed();
    attack(game, a, [dragster]);
    expect(counters(game, dragster, "velocity")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    crewed();
    const before = hand(game).length;
    attack(game, a, [dragster]);
    expect(zone(game, dragster)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });

  it("Clockwork Beast: up to X counters, the choice as it resolves, and never past seven", () => {
    const { game, a } = table();
    const beast = spawn(game, "Clockwork Beast");
    expect(counters(game, beast, "+1/+0")).toBe(7);
    attack(game, a, [beast]);
    expect(counters(game, beast, "+1/+0")).toBe(6);
    nextTurn(game);
    lands(game, "Plains", 3);
    toStep(game, "upkeep");
    a.chooseNumberFn = (_view, offer) => offer.max ?? 0;
    activate(game, beast, 0, { x: 3 });
    expect(counters(game, beast, "+1/+0")).toBe(7);
    expect(game.state.objects[beast].tapped).toBe(true);
  });

  it("Clockwork Beast: with no room, it takes none (the X is still paid)", () => {
    const { game } = table();
    const beast = spawn(game, "Clockwork Beast");
    game.state.objects[beast].counters = { "+1/+0": 8 };
    lands(game, "Plains", 1);
    toStep(game, "upkeep");
    activate(game, beast, 0, { x: 1 });
    expect(counters(game, beast, "+1/+0")).toBe(8);
  });

  it("Clockwork Beast: only during your upkeep", () => {
    const { game } = table();
    const beast = spawn(game, "Clockwork Beast");
    lands(game, "Plains", 1);
    expect(() => activate(game, beast, 0, { x: 1 })).toThrow();
  });
});

describe("attacked during its controller's last turn", () => {
  it("Halls of Mist: one that attacked last turn can't attack this turn, then can the next", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(0);
    // Past the upkeep, so its cumulative upkeep doesn't come into it.
    spawn(game, "Halls of Mist", B);
    let offered: readonly string[] = [];
    a.declareAttackersFn = (view) => {
      const offer = view.legalActions().find((o) => o.kind === "declare-attackers");
      offered = offer === undefined || offer.kind !== "declare-attackers" ? [] : offer.eligible;
      return [];
    };
    toStep(game, "postcombat-main");
    expect(offered).not.toContain(bears);
    expect(offered).toContain(giant);
    nextTurn(game);
    nextTurn(game);
    spawn(game, "Halls of Mist", B);
    toStep(game, "postcombat-main");
    expect(offered).toContain(bears);
  });

  it("is about its controller's last turn: a creature that changed hands since isn't caught", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const asked = { attackedDuringControllersLastTurn: true } as const;
    const matches = () => matchesFilter(game.state, registryOf(game), bears, asked, { you: A });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    // Not the turn under way.
    expect(matches()).toBe(false);
    nextTurn(game);
    // On Bob's turn, Alice's most recent turn is the one it attacked on.
    expect(matches()).toBe(true);
    game.state.objects[bears].controller = B;
    expect(matches()).toBe(false);
    game.state.objects[bears].controller = A;
    nextTurn(game);
    // Alice's own next turn: still the one before it.
    expect(matches()).toBe(true);
  });

  it("an extra combat this turn doesn't overwrite it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const asked = { attackedDuringControllersLastTurn: true } as const;
    const matches = () => matchesFilter(game.state, registryOf(game), bears, asked, { you: A });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    nextTurn(game);
    nextTurn(game);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(matches()).toBe(true);
  });

  it("a new object hasn't (rule 400.7)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(game.state.objects[bears].attackedOnTurns).toHaveLength(1);
    destroy(game, bears);
    expect(game.state.objects[bears].attackedOnTurns).toBeUndefined();
  });

  it("Tangle Kelp: taps as it enters, and keeps down one that attacked on its controller's last turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    const kelp = toHand(game, "Tangle Kelp");
    cast(game, kelp, { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    // Bob's untap step: it didn't attack, so it untaps.
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(1);
    expect(game.state.objects[giant].tapped).toBe(false);
    a.declareAttackersFn = () => [];
  });

  it("Tangle Kelp: one that attacked stays tapped through its controller's next untap", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    const kelp = toHand(game, "Tangle Kelp");
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    toStep(game, "postcombat-main", B);
    nextTurn(game);
    cast(game, kelp, { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(1);
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("attacked you this turn", () => {
  it("Jabari's Influence: a creature that attacked you, after combat, with a -1/-0 counter", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Plains", 5, B);
    const influence = toHand(game, "Jabari's Influence", B);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === B);
    cast(game, influence, { player: B, targets: [ref(giant)] });
    expect(game.state.objects[giant].controller).toBe(B);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 3 });
  });

  it("not one that attacked someone else, or a planeswalker of yours", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Jace Beleren", B);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: C },
      { attacker: bears, defender: walker },
    ];
    lands(game, "Plains", 5, B);
    const influence = toHand(game, "Jabari's Influence", B);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === B);
    expect(() => cast(game, influence, { player: B, targets: [ref(giant)] })).toThrow();
    expect(() => cast(game, influence, { player: B, targets: [ref(bears)] })).toThrow();
  });

  it("only after combat (rule 506.8d): not during it, and not before it", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Plains", 5, B);
    const influence = toHand(game, "Jabari's Influence", B);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === B);
    expect(() => cast(game, influence, { player: B, targets: [ref(giant)] })).toThrow();
  });

  it("is gone next turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "postcombat-main");
    const asked = { attackedYouThisTurn: true } as const;
    expect(matchesFilter(game.state, registryOf(game), giant, asked, { you: B })).toBe(true);
    nextTurn(game);
    expect(matchesFilter(game.state, registryOf(game), giant, asked, { you: B })).toBe(false);
  });
});

describe("a creature is attacking you", () => {
  it("Heroic Return costs {2} less only while one attacks you: not another player", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: C }];
    const dead = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Plains", 4, B);
    const heroic = toHand(game, "Heroic Return", B);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === B);
    expect(() => cast(game, heroic, { player: B, targets: [ref(dead)] })).toThrow();
  });

  it("nor one attacking a planeswalker of yours", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Jace Beleren", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: walker }];
    const dead = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Plains", 4, B);
    const heroic = toHand(game, "Heroic Return", B);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === B);
    expect(() => cast(game, heroic, { player: B, targets: [ref(dead)] })).toThrow();
  });

  it("and with one attacking you, four mana does it", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    const dead = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Plains", 4, B);
    const heroic = toHand(game, "Heroic Return", B);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === B);
    cast(game, heroic, { player: B, targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("battlefield");
    expect(counters(game, dead)).toBe(0);
  });

  it("a Hero enters with two additional +1/+1 counters", () => {
    const { game } = table();
    const dead = toGraveyard(game, "Winter Soldier, Reborn Avenger");
    lands(game, "Plains", 6);
    const heroic = toHand(game, "Heroic Return");
    cast(game, heroic, { targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("battlefield");
    expect(counters(game, dead)).toBe(2);
  });

  it("Watchdog: creatures attacking you get -1/-0 while it's untapped, and not those attacking another", () => {
    const { game, a } = table({ players: 3 });
    const dog = spawn(game, "Watchdog", B);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: C },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null);
    expect(pt(game, giant).power).toBe(2);
    expect(pt(game, bears).power).toBe(2);
    game.state.objects[dog].tapped = true;
    expect(pt(game, giant).power).toBe(3);
  });

  it("Watchdog: it blocks if able", () => {
    const { game, a, b } = table();
    const dog = spawn(game, "Watchdog", B);
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [];
    expect(() => attack(game, a, [giant])).toThrow(/must block/);
    b.declareBlockersFn = () => [{ blocker: dog, attacker: giant }];
    const before = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before);
  });
});
