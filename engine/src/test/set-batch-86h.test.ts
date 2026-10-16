/**
 * Set walk batch 86, part h (2026-10-15): cards blocked on expend, freerunning, forage and valiant, authored now they're built.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const food = (game: Game): ObjectId => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 });
  return named(game, "Food Token", A).at(-1)!;
};
const gone = (game: Game, id: ObjectId): boolean => (game.state.objects[id]?.zone ?? "gone") !== "battlefield";

describe("expend 4: the payment that reaches four, once a turn", () => {
  it("Bakersbane Duo makes a Food, and gets +1/+1 once on reaching four mana", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Bakersbane Duo")); // 2
    const duo = named(game, "Bakersbane Duo", A)[0];
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(pt(game, duo)).toEqual({ power: 2, toughness: 2 });
    cast(game, toHand(game, "Grizzly Bears")); // 4
    expect(pt(game, duo)).toEqual({ power: 3, toughness: 3 });
    cast(game, toHand(game, "Grizzly Bears")); // 6: no second trigger
    expect(pt(game, duo)).toEqual({ power: 3, toughness: 3 });
  });

  it("Bark-Knuckle Boxer gains indestructible", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const boxer = spawn(game, "Bark-Knuckle Boxer");
    expect(keywords(game, boxer).has("indestructible")).toBe(false);
    cast(game, toHand(game, "Hill Giant"));
    expect(keywords(game, boxer).has("indestructible")).toBe(true);
  });

  it("Brambleguard Veteran: Raccoons you control as it resolves get +1/+1 and vigilance, no others", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const veteran = spawn(game, "Brambleguard Veteran");
    const boxer = spawn(game, "Bark-Knuckle Boxer");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Bark-Knuckle Boxer", B);
    cast(game, toHand(game, "Hill Giant"));
    expect(pt(game, veteran)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, veteran).has("vigilance")).toBe(true);
    expect(pt(game, boxer)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, boxer).has("vigilance")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 2 });
    // A Raccoon arriving after it resolved isn't affected (rule 611.2c, the ruling).
    const late = spawn(game, "Junkblade Bruiser");
    expect(pt(game, late)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, late).has("vigilance")).toBe(false);
  });

  it("Byway Barterer may discard its controller's hand to draw two", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Byway Barterer");
    const giant = toHand(game, "Hill Giant");
    const before = hand(game, A).length;
    pickModes(a, 0);
    cast(game, giant);
    expect(hand(game, A)).toHaveLength(2);
    expect(graveyard(game, A)).toHaveLength(before - 1);
  });

  it("Byway Barterer: declined, the hand stays and nothing is drawn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Byway Barterer");
    const giant = toHand(game, "Hill Giant");
    const before = hand(game, A).length;
    pickModes(a);
    cast(game, giant);
    expect(hand(game, A)).toHaveLength(before - 1);
  });

  it("Hoarder's Overflow: a stash counter on entering and on expend 4, then draws that many as sacrificed", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Hoarder's Overflow")); // 2
    const overflow = named(game, "Hoarder's Overflow", A)[0];
    expect(counters(game, overflow, "stash")).toBe(1);
    cast(game, toHand(game, "Grizzly Bears")); // 4
    expect(counters(game, overflow, "stash")).toBe(2);
    cast(game, toHand(game, "Grizzly Bears")); // 6: once a turn
    expect(counters(game, overflow, "stash")).toBe(2);
    const before = hand(game, A).length;
    expect(before).toBeGreaterThan(2);
    activate(game, overflow, 0);
    expect(zone(game, overflow)).toBe("graveyard");
    // Two stash counters as it last existed: two cards, the old hand discarded.
    expect(hand(game, A)).toHaveLength(2);
    expect(graveyard(game, A).length).toBeGreaterThanOrEqual(before);
  });

  it("Junkblade Bruiser: its own five-mana cast already passed four, so it can't trigger that turn", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Junkblade Bruiser"));
    const bruiser = named(game, "Junkblade Bruiser", A)[0];
    cast(game, toHand(game, "Grizzly Bears"));
    expect(pt(game, bruiser)).toEqual({ power: 4, toughness: 5 });
  });

  it("Junkblade Bruiser gets +2/+1 on expend 4", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bruiser = spawn(game, "Junkblade Bruiser");
    cast(game, toHand(game, "Hill Giant"));
    expect(pt(game, bruiser)).toEqual({ power: 6, toughness: 6 });
  });

  it("Roughshod Duo: the target creature you control gets +1/+1 and trample", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Roughshod Duo");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Hill Giant"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("Teapot Slinger deals 2 damage to each opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 4);
    spawn(game, "Teapot Slinger");
    cast(game, toHand(game, "Grizzly Bears", A));
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Grizzly Bears", A));
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 18, 18]);
  });
});

describe("expend 8", () => {
  it("Trailtracker Scout returns up to one target permanent card on reaching eight", () => {
    const { game, a } = table();
    lands(game, "Mountain", 8);
    spawn(game, "Trailtracker Scout");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Hill Giant")); // 4
    expect(seen.asked).toBe(0);
    cast(game, toHand(game, "Hill Giant")); // 8
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(zone(game, bears)).toBe("hand");
  });

  it("Trailtracker Scout: up to one — none chosen, nothing returns", () => {
    const { game, a } = table();
    lands(game, "Mountain", 8);
    spawn(game, "Trailtracker Scout");
    const bears = toGraveyard(game, "Grizzly Bears");
    watchTargets(a);
    cast(game, toHand(game, "Hill Giant"));
    cast(game, toHand(game, "Hill Giant"));
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Muerra gains 3 life at four and exiles the top two to play at eight", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    lands(game, "Forest", 2);
    spawn(game, "Muerra, Trash Tactician");
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Grizzly Bears")];
    cast(game, toHand(game, "Hill Giant"));
    expect(life(game, A)).toBe(23);
    expect(top.every((id) => zone(game, id) === "library")).toBe(true);
    cast(game, toHand(game, "Hill Giant"));
    expect(life(game, A)).toBe(23); // expend 4 doesn't fire again
    expect(top.every((id) => zone(game, id) === "exile")).toBe(true);
    cast(game, top[0], { via: "impulse" });
    expect(zone(game, top[0])).toBe("battlefield");
    // Until the end of alice's next turn.
    lands(game, "Forest", 2);
    const castIt = { type: "cast-spell", player: A, card: top[1], targets: [], via: "impulse" } as const;
    toStep(game, "precombat-main");
    settle(game);
    expect(game.canDispatch(castIt)).toBeNull();
    toStep(game, "precombat-main");
    settle(game);
    expect(game.canDispatch(castIt)).not.toBeNull();
    expect(zone(game, top[1])).toBe("exile");
  });

  it("Muerra adds {R} or {G} for each Raccoon you control at your first main phase, any mix", () => {
    const { game, a } = table();
    spawn(game, "Muerra, Trash Tactician");
    spawn(game, "Bark-Knuckle Boxer");
    spawn(game, "Grizzly Bears");
    spawn(game, "Bark-Knuckle Boxer", B);
    // Two Raccoons (not the Bears, not bob's): two units, offered as each mix.
    let offered: readonly string[] = [];
    a.chooseModesFn = (_v, _min, _max, texts) => {
      offered = texts ?? [];
      return [1];
    };
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.turn.step).toBe("precombat-main");
    expect(offered).toEqual(["Add {R}{R}.", "Add {R}{G}.", "Add {G}{G}."]);
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ R: 1, G: 1 });
  });
});

describe("forage", () => {
  it("Bushy Bodyguard: foraging a Food puts two +1/+1 counters on it", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const snack = food(game);
    pickModes(a, 0);
    cast(game, toHand(game, "Bushy Bodyguard"));
    const guard = named(game, "Bushy Bodyguard", A)[0];
    expect(gone(game, snack)).toBe(true);
    expect(counters(game, guard)).toBe(2);
    expect(pt(game, guard)).toEqual({ power: 4, toughness: 3 });
  });

  it("Bushy Bodyguard: with nothing to forage, no counters", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    cast(game, toHand(game, "Bushy Bodyguard"));
    const guard = named(game, "Bushy Bodyguard", A)[0];
    expect(counters(game, guard)).toBe(0);
    expect(graveyard(game, A)).toHaveLength(1);
  });

  it("Bushy Bodyguard with offspring: the 1/1 copy forages too", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const cards = ["Grizzly Bears", "Hill Giant", "Craw Wurm"].map((name) => toGraveyard(game, name));
    const snack = food(game);
    pickModes(a, 0);
    pickFromZone(a, ...cards);
    cast(game, toHand(game, "Bushy Bodyguard"), { kicked: true });
    const guards = named(game, "Bushy Bodyguard", A);
    expect(guards).toHaveLength(2);
    expect(guards.map((id) => counters(game, id))).toEqual([2, 2]);
    expect(guards.map((id) => pt(game, id).power).sort()).toEqual([3, 4]);
    expect(cards.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(gone(game, snack)).toBe(true);
  });

  it("Curious Forager: when you forage, return target permanent card", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const snack = food(game);
    pickModes(a, 1); // sacrifice the Food, not the three graveyard cards
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Curious Forager");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
    expect(gone(game, snack)).toBe(true);
  });

  it("Curious Forager: declining to forage, no reflexive trigger", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const snack = food(game);
    pickModes(a);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Curious Forager");
    expect(seen.asked).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(gone(game, snack)).toBe(false);
  });
});
