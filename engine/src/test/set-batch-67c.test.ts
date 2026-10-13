/**
 * The set walk, batch 67, part c (2026-10-12): Aetherdrift.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

describe("Redshift, Rocketeer Chief", () => {
  it("adds mana equal to its power that pays for an ability but not a spell", () => {
    const { game } = table();
    const redshift = spawn(game, "Redshift, Rocketeer Chief");
    game.state.objects[redshift].counters = { "+1/+1": 1 };
    const merfolk = spawn(game, "Mindspring Merfolk");
    game.dispatch({ type: "activate-ability", player: A, source: redshift, abilityIndex: 0, targets: [], manaColors: ["U", "U", "U"] });
    expect(game.state.players[A].manaPool).toHaveLength(3);
    // A spell can't spend it.
    expect(canCast(game, toHand(game, "Merfolk Looter"))).toBe(false);
    // An ability can: Mindspring Merfolk's exhaust for X = 1.
    const before = hand(game).length;
    activate(game, merfolk, 0, { x: 1 });
    expect(hand(game).length).toBe(before + 1);
  });

  it("exhaust puts any number of permanent cards from your hand onto the battlefield, once", () => {
    const { game, a } = table();
    const redshift = spawn(game, "Redshift, Rocketeer Chief");
    lands(game, "Wastes", 10);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    const forest = toHand(game, "Forest");
    const bolt = toHand(game, "Lightning Bolt");
    const seen = pickFromZone(a, bears, forest);
    activate(game, redshift, 1);
    expect(seen.offered).toContain(bears);
    expect(seen.offered).toContain(forest);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, bolt)).toBe("hand");
    lands(game, "Wastes", 12);
    expect(canActivate(game, redshift, 1)).toBe(false);
  });
});

describe("Tune Up", () => {
  it("returns a Vehicle as an artifact creature for good", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const cart = toGraveyard(game, "Careening Mine Cart");
    cast(game, toHand(game, "Tune Up"), { targets: [ref(cart)] });
    expect(zone(game, cart)).toBe("battlefield");
    expect(types(game, cart)).toContain("creature");
    nextTurn(game);
    expect(types(game, cart)).toContain("creature");
    expect(pt(game, cart)).toEqual({ power: 3, toughness: 3 });
  });

  it("returns an artifact that isn't a Vehicle as it is", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const relic = toGraveyard(game, "Darksteel Relic");
    cast(game, toHand(game, "Tune Up"), { targets: [ref(relic)] });
    expect(zone(game, relic)).toBe("battlefield");
    expect(types(game, relic)).not.toContain("creature");
  });
});

describe("Guidelight Optimizer", () => {
  it("makes {U} that casts an artifact spell but not another spell", () => {
    const { game } = table();
    const optimizer = spawn(game, "Guidelight Optimizer");
    activate(game, optimizer, 0);
    expect(game.state.players[A].manaPool).toHaveLength(1);
    expect(canCast(game, toHand(game, "Merfolk Looter"))).toBe(false);
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Chitin Gravestalker", () => {
  it("costs {1} less per artifact and/or creature card in your graveyard, an artifact creature counted once", () => {
    const { game } = table();
    toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const stalker = toHand(game, "Chitin Gravestalker");
    // Three off {5}{B}: {2}{B} — two Swamps aren't enough.
    expect(canCast(game, stalker)).toBe(false);
    lands(game, "Swamp", 1);
    cast(game, stalker);
    expect(zone(game, stalker)).toBe("battlefield");
  });
});

describe("Haunt the Network", () => {
  it("makes two Thopters, then drains the target opponent for the artifacts you control", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Haunt the Network"), { targets: [ref(B)] });
    expect(named(game, "Thopter Token")).toHaveLength(2);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Mindspring Merfolk", () => {
  it("draws X and puts a counter on each Merfolk creature you control", () => {
    const { game } = table();
    const merfolk = spawn(game, "Mindspring Merfolk");
    const looter = spawn(game, "Merfolk Looter");
    const theirs = spawn(game, "Merfolk Looter", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    const before = hand(game).length;
    activate(game, merfolk, 0, { x: 2 });
    expect(hand(game).length).toBe(before + 2);
    expect([counters(game, merfolk), counters(game, looter), counters(game, theirs), counters(game, bears)]).toEqual([
      1, 1, 0, 0,
    ]);
  });
});

describe("Rocketeer Boostbuggy", () => {
  it("exhaust makes it an artifact creature for good, with a +1/+1 counter", () => {
    const { game } = table();
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    lands(game, "Wastes", 3);
    expect(types(game, buggy)).not.toContain("creature");
    activate(game, buggy, 0);
    expect(types(game, buggy)).toContain("creature");
    nextTurn(game);
    expect(types(game, buggy)).toContain("creature");
    expect(pt(game, buggy)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Draconautics Engineer", () => {
  it("gives other creatures haste and itself a counter, and makes a 4/4 flying Dinosaur Dragon", () => {
    const { game } = table();
    const engineer = spawn(game, "Draconautics Engineer", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    lands(game, "Mountain", 5);
    activate(game, engineer, 0);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(keywords(game, engineer).has("haste")).toBe(false);
    expect(counters(game, engineer)).toBe(1);
    activate(game, engineer, 1);
    const [dragon] = named(game, "Dinosaur Dragon Token");
    expect(pt(game, dragon)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, dragon).has("flying")).toBe(true);
  });
});

describe("Broodheart Engine and Bounce Off", () => {
  it("Broodheart Engine returns a Vehicle card from your graveyard", () => {
    const { game } = table();
    const engine = spawn(game, "Broodheart Engine");
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const cart = toGraveyard(game, "Careening Mine Cart");
    activate(game, engine, 0, { targets: [ref(cart)] });
    expect(zone(game, cart)).toBe("battlefield");
    expect(zone(game, engine)).toBe("graveyard");
  });

  it("Bounce Off returns an uncrewed Vehicle", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const cart = spawn(game, "Careening Mine Cart", B);
    cast(game, toHand(game, "Bounce Off"), { targets: [ref(cart)] });
    expect(zone(game, cart)).toBe("hand");
  });
});

describe("Veteran Beastrider", () => {
  it("untaps each creature you control at the beginning of your end step", () => {
    const { game } = table();
    spawn(game, "Veteran Beastrider");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});
