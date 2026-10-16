/**
 * Recheck batch 88, part a (2026-10-16): top-5000 cards whose blockers have been built since triage.
 * The One Ring, The Stasis Coffin, The Wandering Emperor and Violent Echoes, on the shared table
 * in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** Whether bob's legal casts of `bolt` right now offer alice as a target. */
const boltAtAlice = (game: Game, bolt: ObjectId): boolean =>
  game
    .legalActions(B)
    .some(
      (a) =>
        a.kind === "cast-spell" &&
        a.card === bolt &&
        (a.targetOptions ?? []).some((slot) => slot.some((t) => t.kind === "player" && t.player === A)),
    );

/** Bob's precombat main (his turn), then alice holds priority. */
function aliceOnBobsTurn(game: Game): void {
  nextTurn(game);
  game.dispatch({ type: "pass-priority", player: B });
  expect(game.state.priority.holder).toBe(A);
}

describe("The One Ring", () => {
  it("cast, it gives you protection from everything until your next turn", () => {
    const { game, b } = table();
    lands(game, "Wastes", 4);
    const ring = toHand(game, "The One Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
    const attacker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Mountain", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    nextTurn(game); // bob's turn
    // Can't be the target of spells (702.16j)…
    expect(boltAtAlice(game, bolt)).toBe(false);
    // …and combat damage to you is prevented.
    attack(game, b, [attacker], A);
    expect(life(game, A)).toBe(20);
    nextTurn(game); // alice's next turn: it's over
    nextTurn(game); // bob's again
    expect(boltAtAlice(game, bolt)).toBe(true);
  });

  it("put onto the battlefield without being cast, it gives no protection", () => {
    const { game } = table();
    enter(game, "The One Ring");
    spawn(game, "Mountain", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    nextTurn(game);
    expect(boltAtAlice(game, bolt)).toBe(true);
  });

  it("taps for a burden counter and a card per counter; your upkeep costs a life per counter", () => {
    const { game } = table();
    const ring = spawn(game, "The One Ring");
    const start = hand(game, A).length;
    activate(game, ring);
    expect(counters(game, ring, "burden")).toBe(1);
    expect(hand(game, A).length).toBe(start + 1);
    nextTurn(game); // bob's upkeep isn't yours
    expect(life(game, A)).toBe(20);
    nextTurn(game); // alice's: lose 1 in the upkeep, then her draw
    expect(life(game, A)).toBe(19);
    const before = hand(game, A).length;
    activate(game, ring);
    expect(counters(game, ring, "burden")).toBe(2);
    expect(hand(game, A).length).toBe(before + 2);
    nextTurn(game);
    nextTurn(game);
    expect(life(game, A)).toBe(17);
  });
});

describe("The Stasis Coffin", () => {
  it("{2}, {T}, exile it: protection from everything until your next turn", () => {
    const { game, b } = table();
    const coffin = spawn(game, "The Stasis Coffin");
    lands(game, "Wastes", 2);
    const attacker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Mountain", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    activate(game, coffin);
    expect(zone(game, coffin)).toBe("exile");
    nextTurn(game);
    expect(boltAtAlice(game, bolt)).toBe(false);
    attack(game, b, [attacker], A);
    expect(life(game, A)).toBe(20);
    nextTurn(game);
    nextTurn(game);
    expect(boltAtAlice(game, bolt)).toBe(true);
  });
});

describe("The Wandering Emperor", () => {
  it("flashed in on an opponent's turn, she may activate a loyalty ability then — once", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    aliceOnBobsTurn(game);
    const emperor = toHand(game, "The Wandering Emperor");
    cast(game, emperor);
    expect(zone(game, emperor)).toBe("battlefield");
    expect(game.state.objects[emperor].counters.loyalty).toBe(3);
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    loyalty(game, emperor, -1);
    expect(tokensNamed(game, "Samurai Token", A)).toBe(1);
    const samurai = named(game, "Samurai Token", A)[0];
    expect(pt(game, samurai)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, samurai).has("vigilance")).toBe(true);
    // Still only one loyalty ability that turn (the ruling).
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(() => loyalty(game, emperor, 1)).toThrow(/already been activated/);
  });

  it("on a later opponent's turn she's back to sorcery speed", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    aliceOnBobsTurn(game);
    const emperor = toHand(game, "The Wandering Emperor");
    cast(game, emperor);
    nextTurn(game); // alice's turn 3: her main phase is fine
    loyalty(game, emperor, -1);
    expect(tokensNamed(game, "Samurai Token", A)).toBe(1);
    aliceOnBobsTurn(game); // bob's turn 4: she didn't enter this turn
    expect(() => loyalty(game, emperor, 1)).toThrow(/refused/);
  });

  it("+1 puts a +1/+1 counter on up to one creature and gives it first strike this turn", () => {
    const { game } = table();
    const emperor = spawn(game, "The Wandering Emperor");
    game.state.objects[emperor].counters.loyalty = 3;
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, emperor, 1, { targets: [ref(bears)] });
    expect(game.state.objects[emperor].counters.loyalty).toBe(4);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("+1 with no target still adds loyalty", () => {
    const { game } = table();
    const emperor = spawn(game, "The Wandering Emperor");
    game.state.objects[emperor].counters.loyalty = 3;
    loyalty(game, emperor, 1, { targets: [null] });
    expect(game.state.objects[emperor].counters.loyalty).toBe(4);
  });

  it("−2 exiles a tapped creature and gains 2 life; an untapped one isn't a target", () => {
    const { game } = table();
    const emperor = spawn(game, "The Wandering Emperor");
    game.state.objects[emperor].counters.loyalty = 3;
    const untapped = spawn(game, "Grizzly Bears", B);
    expect(() => loyalty(game, emperor, -2, { targets: [ref(untapped)] })).toThrow(/refused/);
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    loyalty(game, emperor, -2, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("exile");
    expect(life(game, A)).toBe(22);
  });
});

describe("Violent Echoes", () => {
  it("6 damage to a 2/2: empower Jace 4 — a Jace token made, a nontoken Jace untouched", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const beleren = spawn(game, "Jace Beleren");
    game.state.objects[beleren].counters.loyalty = 3;
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Violent Echoes"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    const jaces = named(game, "Jace Token", A);
    expect(jaces.length).toBe(1);
    expect(game.state.objects[jaces[0]].counters.loyalty).toBe(4);
    expect(game.state.objects[beleren].counters.loyalty).toBe(3);
  });

  it("no excess, no Jace; damage already marked counts toward lethal", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Violent Echoes"), { targets: [ref(dreadmaw)] });
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(named(game, "Jace Token", A).length).toBe(0);
    const marked = spawn(game, "Colossal Dreadmaw", B);
    game.state.objects[marked].damageMarked = 2;
    cast(game, toHand(game, "Violent Echoes"), { targets: [ref(marked)] });
    const jaces = named(game, "Jace Token", A);
    expect(jaces.length).toBe(1);
    expect(game.state.objects[jaces[0]].counters.loyalty).toBe(2);
  });

  it("a planeswalker's excess is past its loyalty, and goes on the Jace token you already have", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    game.debugApplyEffect(A, { kind: "empower-jace", amount: 1 });
    const jace = named(game, "Jace Token", A)[0];
    const chandra = spawn(game, "Chandra, Torch of Defiance", B);
    game.state.objects[chandra].counters.loyalty = 4;
    cast(game, toHand(game, "Violent Echoes"), { targets: [ref(chandra)] });
    expect(zone(game, chandra)).toBe("graveyard");
    expect(named(game, "Jace Token", A)).toEqual([jace]);
    expect(game.state.objects[jace].counters.loyalty).toBe(3);
  });
});
